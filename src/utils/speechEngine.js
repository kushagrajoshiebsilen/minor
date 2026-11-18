import { getLanguageMeta } from '../i18n/languages';

let currentAudio = null;

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
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
  isAudioPlaying = false;

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Single-voice text-to-speech engine.
 * Never runs both audio and native speech simultaneously.
 */
export function speakText(text, langCode = 'en', onEnd = null) {
  if (!text) return;
  // Always cancel any in-flight voice first
  stopSpeaking();

  const meta = getLanguageMeta(langCode);
  const ttsCode = meta.ttsCode || 'en';
  const speechCode = meta.speechCode || 'en-IN';
  const shortText = text.slice(0, 195);

  const speakNativeOnly = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(shortText);
      utter.lang = speechCode;
      utter.rate = 0.95;
      utter.onend = () => {
        isAudioPlaying = false;
        if (onEnd) onEnd();
      };
      utter.onerror = () => {
        isAudioPlaying = false;
        if (onEnd) onEnd();
      };
      isAudioPlaying = true;
      window.speechSynthesis.speak(utter);
    } catch {
      isAudioPlaying = false;
      if (onEnd) onEnd();
    }
  };

  // Try server proxy first
  try {
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(shortText)}&lang=${encodeURIComponent(ttsCode)}`);
    currentAudio = audio;
    isAudioPlaying = true;

    audio.onended = () => {
      currentAudio = null;
      isAudioPlaying = false;
      if (onEnd) onEnd();
    };

    // If audio element encounters network/proxy error, gracefully fallback to browser synthesis alone
    audio.onerror = () => {
      currentAudio = null;
      isAudioPlaying = false;
      speakNativeOnly();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked or error: fallback cleanly
        currentAudio = null;
        isAudioPlaying = false;
        speakNativeOnly();
      });
    }
  } catch {
    speakNativeOnly();
  }
}

/**
 * Robust Speech Recognizer with permission check & auto restart protection
 */
export function createSpeechRecognizer({ language = 'en', onResult, onInterim, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  const meta = getLanguageMeta(language);

  // Set regional speech code e.g. hi-IN, gu-IN, ta-IN
  recognizer.lang = meta.speechCode || 'en-IN';
  recognizer.continuous = true;
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
