import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function parseDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

async function callOpenAiCompatible({ endpoint, apiKey, model, systemPrompt, userPrompt, imageDataUrl, jsonMode, temperature }) {
  const userContent = imageDataUrl
    ? [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: imageDataUrl } },
    ]
    : userPrompt;

  const body = {
    model,
    temperature: temperature ?? 0.5,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  };

  if (jsonMode && !imageDataUrl) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg = payload?.error?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  return payload?.choices?.[0]?.message?.content || '';
}

async function resolveImageAsInlineData(imageInput) {
  if (!imageInput) return null;
  const parsed = parseDataUrl(imageInput);
  if (parsed) return parsed;
  if (/^https?:\/\//i.test(imageInput)) {
    const resp = await fetch(imageInput);
    if (!resp.ok) return null;
    const mimeType = resp.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    const buf = Buffer.from(await resp.arrayBuffer());
    return { mimeType, base64: buf.toString('base64') };
  }
  return null;
}

async function callGemini({ apiKey, model, systemPrompt, userPrompt, imageDataUrl, jsonMode, temperature }) {
  const parts = [{ text: userPrompt }];
  if (imageDataUrl) {
    const inline = await resolveImageAsInlineData(imageDataUrl);
    if (inline) {
      parts.push({
        inlineData: {
          mimeType: inline.mimeType,
          data: inline.base64,
        },
      });
    }
  }

  const body = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: temperature ?? 0.5,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errMsg = payload?.error?.message || `Gemini HTTP ${response.status}`;
    throw new Error(errMsg);
  }

  return payload?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

async function executeSingleProvider({ provider, apiKey, modelOverride, env, hasImage, systemPrompt, userPrompt, imageDataUrl, jsonMode, temperature }) {
  if (provider === 'grok') {
    const usedModel = modelOverride || (hasImage ? (env.XAI_VISION_MODEL || 'grok-2-vision-1212') : (env.XAI_MODEL || 'grok-3-mini'));
    const text = await callOpenAiCompatible({
      endpoint: 'https://api.x.ai/v1/chat/completions',
      apiKey,
      model: usedModel,
      systemPrompt,
      userPrompt,
      imageDataUrl,
      jsonMode,
      temperature,
    });
    return { text, model: usedModel };
  }
  if (provider === 'gemini') {
    const usedModel = modelOverride || env.GEMINI_MODEL || 'gemini-2.5-flash';
    const text = await callGemini({
      apiKey,
      model: usedModel,
      systemPrompt,
      userPrompt,
      imageDataUrl,
      jsonMode,
      temperature,
    });
    return { text, model: usedModel };
  }
  if (provider === 'groq') {
    const usedModel = modelOverride || (hasImage ? (env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct') : (env.GROQ_MODEL || 'llama-3.3-70b-versatile'));
    const text = await callOpenAiCompatible({
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey,
      model: usedModel,
      systemPrompt,
      userPrompt,
      imageDataUrl,
      jsonMode,
      temperature,
    });
    return { text, model: usedModel };
  }
  if (provider === 'openai') {
    const usedModel = modelOverride || env.OPENAI_MODEL || 'gpt-4o-mini';
    const text = await callOpenAiCompatible({
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey,
      model: usedModel,
      systemPrompt,
      userPrompt,
      imageDataUrl,
      jsonMode,
      temperature,
    });
    return { text, model: usedModel };
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
}

const karigarApiPlugin = (env) => ({
  name: 'karigar-unified-api-middleware',
  configureServer(server) {
    // 1. Check server-side configured AI providers (never leaks raw keys)
    server.middlewares.use('/api/ai/status', (req, res) => {
      const configuredProvider = (env.AI_PROVIDER || 'grok').toLowerCase();
      const keyMap = {
        grok: Boolean((env.XAI_API_KEY || '').trim()),
        gemini: Boolean((env.GEMINI_API_KEY || '').trim()),
        groq: Boolean((env.GROQ_API_KEY || '').trim()),
        openai: Boolean((env.OPENAI_API_KEY || '').trim()),
      };
      const failoverChain = [configuredProvider, 'grok', 'gemini', 'groq', 'openai']
        .filter((p, idx, arr) => arr.indexOf(p) === idx && keyMap[p]);
      sendJson(res, 200, {
        defaultProvider: configuredProvider,
        serverKeysConfigured: keyMap,
        failoverChain,
      });
    });

    // 2. Unified Provider-Agnostic AI Chat / Vision Endpoint with Smart Auto-Failover
    server.middlewares.use('/api/ai/chat', async (req, res) => {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        });
        res.end();
        return;
      }

      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Method not allowed' });
        return;
      }

      try {
        const body = await readJsonBody(req);
        const primaryProvider = (body.provider || env.AI_PROVIDER || 'grok').toLowerCase();
        const hasImage = Boolean(body.imageDataUrl);
        const disableFailover = Boolean(body.disableFailover);

        const envKeys = {
          grok: (env.XAI_API_KEY || '').trim(),
          gemini: (env.GEMINI_API_KEY || '').trim(),
          groq: (env.GROQ_API_KEY || '').trim(),
          openai: (env.OPENAI_API_KEY || '').trim(),
        };

        const candidateOrder = disableFailover
          ? [primaryProvider]
          : [primaryProvider, 'gemini', 'groq', 'openai', 'grok'].filter((p, idx, arr) => arr.indexOf(p) === idx);

        const systemPrompt = body.systemPrompt || 'You are a helpful Indian handicraft expert.';
        const userPrompt = body.userPrompt || '';
        const jsonMode = Boolean(body.jsonMode);
        const temperature = body.temperature ?? 0.5;

        const errors = [];
        for (const candidate of candidateOrder) {
          const isPrimary = candidate === primaryProvider;
          const apiKey = (isPrimary && (body.apiKey || '').trim()) || envKeys[candidate];
          if (!apiKey) {
            if (disableFailover) {
              sendJson(res, 400, {
                error: `No API key configured for provider "${candidate}". Add it in AI Settings or .env.`,
                code: 'NO_API_KEY',
              });
              return;
            }
            continue;
          }

          try {
            const out = await executeSingleProvider({
              provider: candidate,
              apiKey,
              modelOverride: isPrimary ? (body.model || '').trim() : '',
              env,
              hasImage,
              systemPrompt,
              userPrompt,
              imageDataUrl: body.imageDataUrl,
              jsonMode,
              temperature,
            });

            if (!isPrimary) {
              console.log(`[KarigarBazaar AI Failover] Switched cleanly from ${primaryProvider} -> ${candidate} (${out.model})`);
            }

            sendJson(res, 200, {
              text: out.text,
              provider: candidate,
              model: out.model,
              failoverUsed: !isPrimary,
              primaryProvider,
            });
            return;
          } catch (err) {
            console.warn(`[KarigarBazaar AI] Provider "${candidate}" failed: ${err?.message}`);
            errors.push(`${candidate}: ${err?.message || 'failed'}`);
          }
        }

        if (errors.length === 0) {
          sendJson(res, 400, {
            error: 'No AI API keys configured. Add at least one key in .env or AI Settings.',
            code: 'NO_API_KEY',
          });
          return;
        }

        sendJson(res, 502, {
          error: `All configured AI providers failed (${errors.join(' | ')})`,
          code: 'ALL_PROVIDERS_FAILED',
        });
      } catch (err) {
        console.error('Unified AI Proxy Error:', err);
        sendJson(res, 502, {
          error: err?.message || 'Upstream AI provider failed',
          code: 'PROVIDER_ERROR',
        });
      }
    });

    // 3. Regional Indian Text-to-Speech Proxy (/api/tts)
    server.middlewares.use('/api/tts', async (req, res) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
        const text = (url.searchParams.get('text') || '').slice(0, 200);
        const lang = url.searchParams.get('lang') || 'hi';

        if (!text) {
          res.statusCode = 400;
          res.end('Missing text');
          return;
        }

        const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: '*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Upstream TTS HTTP ${response.status}`);
        }

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        });

        const arrayBuffer = await response.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
      } catch (err) {
        console.error('TTS Proxy Error:', err?.message);
        res.statusCode = 500;
        res.end('TTS generation error');
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), karigarApiPlugin(env)],
  };
});
