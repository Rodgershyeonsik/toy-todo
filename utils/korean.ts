const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const JONGSEONG_COUNT = 28;
const RIEUL_JONGSEONG = 8;

// "공부로" / "운동으로"처럼 받침에 따라 조사를 골라 붙인다.
export const withRoParticle = (word: string) => {
  const last = word.charCodeAt(word.length - 1);

  if (Number.isNaN(last) || last < HANGUL_START || last > HANGUL_END)
    return `${word}로`;

  const jongseong = (last - HANGUL_START) % JONGSEONG_COUNT;
  // 받침이 없거나 ㄹ받침이면 "로", 나머지는 "으로"
  return jongseong === 0 || jongseong === RIEUL_JONGSEONG
    ? `${word}로`
    : `${word}으로`;
};
