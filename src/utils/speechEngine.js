import { getLanguageMeta } from '../i18n/languages';

let currentAudio = null;
let currentUtterance = null;

export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  currentUtterance = null;
}

/**
 * Robust Speech Synthesizer
 * Uses Web SpeechSynthesis first for immediate, zero-latency local speech without proxy lag or CORS block,
 * and falls back seamlessly to server TTS proxy when needed.
 */
export function speakText(text, langCode = 'en', onEnd = null) {
  if (!text) return;
  stopSpeaking();

  const meta = getLanguageMeta(langCode);
  const speechCode = meta.speechCode || 'en-IN';
  const ttsCode = meta.ttsCode || 'en';
  const cleanText = text.replace(/[\*\_\#\~]/g, '').slice(0, 200);

  // Strategy 1: Browser Native SpeechSynthesis (Instant, 100% reliable locally, zero network delay)
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = speechCode;
      utter.rate = 0.95;
      utter.pitch = 1.0;

      // Pick matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice =
          voices.find((v) => v.lang === speechCode || v.lang.startsWith(ttsCode)) ||
          voices.find((v) => v.lang.includes('IN')) ||
          voices[0];
        if (matchingVoice) {
          utter.voice = matchingVoice;
        }
      }

      utter.onend = () => {
        currentUtterance = null;
        if (onEnd) onEnd();
      };

      utter.onerror = (err) => {
        console.warn('SpeechSynthesis error, trying audio fallback:', err);
        currentUtterance = null;
        playProxyAudio(cleanText, ttsCode, onEnd);
      };

      currentUtterance = utter;
      window.speechSynthesis.speak(utter);
      return;
    } catch (e) {
      console.warn('SpeechSynthesis failed:', e);
    }
  }

  // Strategy 2: Server audio proxy fallback
  playProxyAudio(cleanText, ttsCode, onEnd);
}

function playProxyAudio(text, lang, onEnd) {
  try {
    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`
    );
    currentAudio = audio;

    audio.onended = () => {
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      currentAudio = null;
      if (onEnd) onEnd();
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        currentAudio = null;
        if (onEnd) onEnd();
      });
    }
  } catch {
    if (onEnd) onEnd();
  }
}

/**
 * Robust Speech Recognizer with permission check & mobile fallback
 */
export function createSpeechRecognizer({
  language = 'en',
  onResult,
  onInterim,
  onEnd,
  onError,
}) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  const meta = getLanguageMeta(language);

  // Set regional speech code (e.g., 'hi-IN', 'gu-IN', 'ta-IN', 'en-IN')
  recognizer.lang = meta.speechCode || 'en-IN';
  recognizer.continuous = false; // continuous = false is much more reliable across mobile browsers & Chrome
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  let hasSpoken = false;

  recognizer.onresult = (event) => {
    hasSpoken = true;
    let interimText = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const phrase = event.results[i][0]?.transcript || '';
      if (event.results[i].isFinal) {
        finalText += phrase;
      } else {
        interimText += phrase;
      }
    }

    if (interimText && onInterim) onInterim(interimText.trim());
    if (finalText && onResult) onResult(finalText.trim());
  };

  recognizer.onerror = (e) => {
    console.warn('SpeechRecognition error:', e?.error);
    if (onError) onError(e?.error || 'speech-error');
  };

  recognizer.onend = () => {
    if (onEnd) onEnd(hasSpoken);
  };

  return recognizer;
}
