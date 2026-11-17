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
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function speakText(text, langCode = 'en', onEnd = null) {
  if (!text) return;
  stopSpeaking();

  const meta = getLanguageMeta(langCode);
  const ttsCode = meta.ttsCode || 'en';
  const speechCode = meta.speechCode || 'en-IN';
  const shortText = text.slice(0, 195);

  const fallbackNative = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }
    try {
      const utter = new SpeechSynthesisUtterance(shortText);
      utter.lang = speechCode;
      utter.rate = 0.95;
      utter.onend = () => onEnd && onEnd();
      utter.onerror = () => onEnd && onEnd();
      window.speechSynthesis.speak(utter);
    } catch {
      if (onEnd) onEnd();
    }
  };

  try {
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(shortText)}&lang=${encodeURIComponent(ttsCode)}`);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      currentAudio = null;
      fallbackNative();
    };
    audio.play().catch(() => {
      currentAudio = null;
      fallbackNative();
    });
  } catch {
    fallbackNative();
  }
}

export function createSpeechRecognizer({ language = 'en', onResult, onInterim, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  const meta = getLanguageMeta(language);

  recognizer.lang = meta.speechCode || 'en-IN';
  recognizer.continuous = false;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
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
    if (onError) onError(e?.error || 'speech-error');
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}
