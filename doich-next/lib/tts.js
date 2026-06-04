function applyGermanPhonetics(text) {
  return text
    .replace(/tion/gi, 'tsion')  // Nation→Natsion, information→informatsion
    .replace(/al$/i, 'ahl');     // digital→digitahl, global→globahl, neutral→neutrahl
}

export function getTtsText(word) {
  if (word.tts) return word.tts;

  if (word.type === 'noun' && word.gender) {
    // Some de fields already include the article — strip it first to avoid doubling
    const bare = word.de.replace(/^(der|die|das) /i, '');
    return `${word.gender} ${bare}`;
  }

  // Only apply phonetic transforms to adj / adv / verb
  return applyGermanPhonetics(word.de);
}
