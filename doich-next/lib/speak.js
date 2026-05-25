let _voice = null;

function resolveVoice() {
  if (_voice) return _voice;
  const voices = window.speechSynthesis.getVoices();
  _voice =
    voices.find(v => v.lang === 'de-DE' && v.localService) ||
    voices.find(v => v.lang === 'de-DE') ||
    voices.find(v => v.lang.startsWith('de')) ||
    null;
  return _voice;
}

function fire(text) {
  window.speechSynthesis.cancel();
  const utt  = new SpeechSynthesisUtterance(text);
  utt.lang   = 'de-DE';
  utt.rate   = 0.85;
  utt.pitch  = 1;
  const voice = resolveVoice();
  if (voice) utt.voice = voice;
  window.speechSynthesis.speak(utt);
}

export function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => fire(text), { once: true });
  } else {
    fire(text);
  }
}
