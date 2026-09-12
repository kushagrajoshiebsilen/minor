// Robust Web Speech & Audio Helper for Karigar Voice Assistance

let currentAudio = null;
let cachedVoices = [];

// Initialize available voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices() || [];
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  };
}

export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const isSpeechSynthesisSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

// Check for installed OS / browser voice
export const getAvailableVoice = (langCode = 'hi') => {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : (window.speechSynthesis.getVoices() || []);
  if (!voices || voices.length === 0) return null;

  if (langCode === 'hi') {
    return voices.find(v => 
      v.lang === 'hi-IN' || 
      v.lang.startsWith('hi') || 
      v.name.toLowerCase().includes('hindi') || 
      v.name.toLowerCase().includes('kalpana') || 
      v.name.toLowerCase().includes('hemant') ||
      v.name.includes('हिन्दी')
    );
  } else if (langCode === 'bn') {
    return voices.find(v => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali'));
  } else if (langCode === 'ta') {
    return voices.find(v => v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil'));
  } else {
    return voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
  }
};

// Play Hindi / Regional Speech via high quality server-proxied audio (bypasses browser CORS & Referer blocking)
const playProxyAudio = (text, language = 'hi', onEnd = null) => {
  stopSpeaking();

  try {
    const cleanText = text.trim();
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    // Split by punctuation: । , ? ! .
    const chunks = cleanText.match(/[^।?!.,]+[।?!.,]?/g) || [cleanText];
    let currentIndex = 0;

    const playNextChunk = () => {
      if (currentIndex >= chunks.length) {
        currentAudio = null;
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[currentIndex].trim();
      currentIndex++;

      if (!chunk) {
        playNextChunk();
        return;
      }

      const langCode = language === 'hi' ? 'hi' : language === 'bn' ? 'bn' : language === 'ta' ? 'ta' : 'en';
      // Use local same-origin proxy (avoids Google 403 / Referer blocking)
      const audioUrl = `/api/tts?text=${encodeURIComponent(chunk)}&lang=${langCode}`;

      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = (e) => {
        console.warn('Audio proxy playback failed, attempting speech synthesis fallback:', e);
        // Fallback to browser synthesis if audio fails
        playBrowserSynthesis(chunk, language, playNextChunk);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play was prevented by browser policy, falling back:', err);
          playBrowserSynthesis(chunk, language, playNextChunk);
        });
      }
    };

    playNextChunk();
  } catch (err) {
    console.error('playProxyAudio error:', err);
    playBrowserSynthesis(text, language, onEnd);
  }
};

// Browser Web Speech Synthesis fallback
const playBrowserSynthesis = (text, language = 'hi', onEnd = null) => {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'bn') {
      utterance.lang = 'bn-IN';
    } else if (language === 'ta') {
      utterance.lang = 'ta-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Use best available voice or fallback to default
    const voice = getAvailableVoice(language) || getAvailableVoice('en');
    if (voice) {
      utterance.voice = voice;
    }

    let finished = false;
    const done = () => {
      if (!finished) {
        finished = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = done;
    utterance.onerror = (e) => {
      console.warn('Utterance error:', e);
      done();
    };

    window.speechSynthesis.speak(utterance);

    // Chrome resume watchdog
    setTimeout(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 200);

  } catch (e) {
    console.error('Browser synthesis failed:', e);
    if (onEnd) onEnd();
  }
};

// Main function to speak any text
export const speakText = (text, language = 'hi', onEnd = null) => {
  stopSpeaking();

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  // Always use the proxy audio stream for Hindi & Indic languages (gives fluent, human Hindi voice)
  if (language === 'hi' || language === 'bn' || language === 'ta') {
    playProxyAudio(text, language, onEnd);
    return;
  }

  // For English, use native Web Speech if voice exists, else proxy audio
  const nativeVoice = getAvailableVoice(language);
  if (nativeVoice) {
    playBrowserSynthesis(text, language, onEnd);
  } else {
    playProxyAudio(text, language, onEnd);
  }
};

// Stop any currently playing speech or audio
export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }
};

// Speech-to-Text (Listens to Karigar's spoken answers)
export const createSpeechRecognizer = ({ language = 'hi', onResult, onEnd, onError }) => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;

  if (language === 'hi') {
    recognition.lang = 'hi-IN';
  } else if (language === 'bn') {
    recognition.lang = 'bn-IN';
  } else if (language === 'ta') {
    recognition.lang = 'ta-IN';
  } else {
    recognition.lang = 'en-IN';
  }

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (onResult) {
      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    }
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  return recognition;
};
