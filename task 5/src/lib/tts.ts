/**
 * Text to Speech engine using browser SpeechSynthesis API
 */

export function readAloud(text: string, onEnd?: () => void): boolean {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any active utterance

    // Strip markdown formatting if any
    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/[*_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 350); // Keep reasonable reading length

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick standard english voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Google')) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech error:', err);
    return false;
  }
}

export function stopReading(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
