import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const ttsPlugin = () => ({
  name: 'tts-proxy-middleware',
  configureServer(server) {
    server.middlewares.use('/api/tts', async (req, res) => {
      try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
        const text = url.searchParams.get('text');
        const lang = url.searchParams.get('lang') || 'hi';

        if (!text) {
          res.statusCode = 400;
          res.end('Missing text');
          return;
        }

        // Fetch audio stream server-side (no browser Referer blocking)
        const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`Upstream TTS returned status ${response.status}`);
        }

        res.writeHead(200, {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400'
        });

        const arrayBuffer = await response.arrayBuffer();
        res.end(Buffer.from(arrayBuffer));
      } catch (err) {
        console.error('TTS Proxy Error:', err);
        res.statusCode = 500;
        res.end('TTS generation error');
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ttsPlugin()
  ],
})
