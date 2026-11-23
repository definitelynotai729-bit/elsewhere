// Text from other players, made safe to show whatever the filter setting: compatibility forms folded (𝐟𝐮𝐜𝐤 and ｆｕｃｋ
// become plain letters), invisible and direction-flipping characters removed (a zero-width joiner stays where it
// joins emoji), and stacks of accents (Zalgo text) flattened. Used by safety.js and the word filter (profanity.js).
export const prep = (t) => String(t == null ? '' : t).normalize('NFKC')
  .replace(/[\u0000-\u001f\u007f]/g, ' ')
  .replace(/[\p{Cf}]/gu, (c) => (c === '‍' ? c : ''))
  .replace(/‍(?!\p{Extended_Pictographic})/gu, '')
  .replace(/\p{M}{3,}/gu, '')
  .trim();
