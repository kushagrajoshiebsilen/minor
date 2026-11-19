import { getLanguageMeta } from '../i18n/languages';

let currentAudio = null;
let currentUtterance = null;
let activeSpeakToken = 0;

export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

/**
 * Hard stop any active sound or browser utterance immediately
 */
export function stopSpeaking() {
  // Invalidate any in-flight async speak token
  activeSpeakToken += 1;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.load();
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
 * Strictly single-voice text-to-speech.
 * Guarantees that only ONE single voice (never two voices together) speaks at any time.
 */
export function speakText(text, langCode = 'en', onEnd = null) {
  if (!text) return;

  // 1. Immediately kill any playing audio, previous utterance, or background speech
  stopSpeaking();
  const token = activeSpeakToken;

  const meta = getLanguageMeta(langCode);
  const speechCode = meta.speechCode || 'en-IN';
  const ttsCode = meta.ttsCode || 'en';
  const cleanText = text.replace(/[*_#~`]/g, '').slice(0, 200);

  // Preference: Use the high-quality server proxy MP3 stream ONLY
  // If it works, speech is crystal-clear Indian dialect without robot voice.
  // We NEVER start browser speech simultaneously.
  try {
    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(ttsCode)}`
    );
    currentAudio = audio;

    let hasEnded = false;
    const finish = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (currentAudio === audio) {
        currentAudio = null;
      }
      if (token === activeSpeakToken && onEnd) {
        onEnd();
      }
    };

    audio.onended = finish;

    // Only fallback if the proxy network request strictly fails (offline / proxy error)
    audio.onerror = () => {
      if (token !== activeSpeakToken) return;
      currentAudio = null;
      fallbackBrowserSpeech(cleanText, speechCode, ttsCode, token, onEnd);
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        // Autoplay blocked by browser policy without user gesture: fallback to speech synthesis
        if (token !== activeSpeakToken) return;
        currentAudio = null;
        fallbackBrowserSpeech(cleanText, speechCode, ttsCode, token, onEnd);
      });
    }
  } catch {
    fallbackBrowserSpeech(cleanText, speechCode, ttsCode, token, onEnd);
  }
}

/**
 * Dedicated single-fallback speech synthesis
 */
function fallbackBrowserSpeech(cleanText, speechCode, ttsCode, token, onEnd) {
  if (token !== activeSpeakToken) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = speechCode;
    utter.rate = 0.95;

    // Filter available voices to pick exactly ONE matching voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match =
        voices.find((v) => v.lang === speechCode) ||
        voices.find((v) => v.lang.startsWith(ttsCode)) ||
        voices.find((v) => v.lang.includes('IN')) ||
        voices[0];
      if (match) utter.voice = match;
    }

    utter.onend = () => {
      currentUtterance = null;
      if (token === activeSpeakToken && onEnd) onEnd();
    };

    utter.onerror = () => {
      currentUtterance = null;
      if (token === activeSpeakToken && onEnd) onEnd();
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  } catch {
    currentUtterance = null;
    if (onEnd) onEnd();
  }
}

/**
 * Robust Speech Recognizer
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

  recognizer.lang = meta.speechCode || 'en-IN';
  recognizer.continuous = false;
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
