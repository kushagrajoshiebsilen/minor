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
 * Guarantees that only ONE single voice speaks at any time.
 */
export function speakText(text, langCode = 'en', onEnd = null) {
  if (!text) return;

  stopSpeaking();
  const token = activeSpeakToken;

  const meta = getLanguageMeta(langCode);
  const speechCode = meta.speechCode || 'en-IN';
  const ttsCode = meta.ttsCode || 'en';
  const cleanText = text.replace(/[*_#~`]/g, '').slice(0, 250);

  // 1. Try server proxy TTS first for crystal-clear natural audio
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

    audio.onerror = () => {
      if (token !== activeSpeakToken) return;
      currentAudio = null;
      fallbackBrowserSpeech(cleanText, speechCode, ttsCode, token, onEnd);
    };

    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
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
 * Robust Speech Recognizer with Continuous Capture & Interim Streaming
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

  // Set Indian English / Hindi / regional BCP-47 tag
  recognizer.lang = meta.speechCode || (language === 'hi' ? 'hi-IN' : 'en-IN');
  // continuous = true so Chrome doesn't abort while user pauses or takes a breath
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  let hasSpoken = false;
  let lastCaptured = '';
  let silenceTimer = null;
  let hasEmittedFinal = false;

  const emitFinalResult = (text) => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    const clean = text?.trim();
    if (!clean) return;
    hasEmittedFinal = true;
    if (onResult) {
      onResult(clean);
    }
  };

  recognizer.onresult = (event) => {
    let interimText = '';
    let finalText = '';

    for (let i = 0; i < event.results.length; i += 1) {
      const item = event.results[i];
      const phrase = item[0]?.transcript || '';
      if (item.isFinal) {
        finalText += (finalText ? ' ' : '') + phrase;
      } else {
        interimText += (interimText ? ' ' : '') + phrase;
      }
    }

    const currentText = (finalText || interimText || '').trim();
    if (currentText) {
      hasSpoken = true;
      lastCaptured = currentText;
      hasEmittedFinal = false;
      if (onInterim) onInterim(currentText);

      if (finalText) {
        emitFinalResult(finalText.trim());
      } else {
        // Debounce auto-finalizer on natural pause (1.2s)
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (!hasEmittedFinal && lastCaptured) {
            emitFinalResult(lastCaptured);
          }
        }, 1200);
      }
    }
  };

  recognizer.onerror = (e) => {
    const err = e?.error;
    console.warn('SpeechRecognition event error:', err);
    if (err === 'no-speech') {
      // Harmless silence timeout, ignore so user can still speak
      return;
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    if (onError) onError(err || 'speech-error');
  };

  recognizer.onend = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
    // If recognition ended with text captured that was not yet finalized
    if (hasSpoken && !hasEmittedFinal && lastCaptured) {
      emitFinalResult(lastCaptured);
    }
    if (onEnd) onEnd(hasSpoken);
  };

  return recognizer;
}
