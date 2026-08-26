const parseSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return { h: h, m: m, s: s };
};

export const parseMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return { h: h, m: m };
};

export const formatTime = (seconds: number) => {
  const { h, m, s } = parseSeconds(seconds);

  return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${
    s < 10 ? `0${s}` : s
  }`;
};

export const formatTimeToEn = (seconds: number) => {
  const { h, m, s } = parseSeconds(seconds);

  let formatStr = "";

  if (seconds === 0) return "0s";

  if (h > 0) {
    formatStr = formatStr + h + "h";
  }

  if (m > 0) {
    if (formatStr.length > 0) formatStr += " ";
    formatStr = formatStr + m + "m";
  }

  if (s > 0) {
    if (formatStr.length > 0) formatStr += " ";
    formatStr = formatStr + s + "s";
  }

  return formatStr;
};

export const formatMinutesToEn = (minutes: number) => {
  const { h, m } = parseMinutes(minutes);

  if (minutes === 0) return "0m";

  if (h > 0 && m > 0) return `${h}h ${m}m`;

  if (h > 0) return `${h}h`;

  return `${m}m`;
};

export const formatTimeToKr = (seconds: number) => {
  const { h, m, s } = parseSeconds(seconds);

  if (seconds <= 0) return "0초";

  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  if (s > 0) parts.push(`${s}초`);

  return parts.join(" ");
};

// 차트 라벨용
export const formatTimeToEnShort = (seconds: number) => {
  if (seconds < 60) return formatTimeToEn(seconds);

  return formatMinutesToEn(Math.floor(seconds / 60));
};

export const formatTimeToKrShort = (seconds: number) => {
  if (seconds <= 0) return "0분";

  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return "1분 미만";

  const { h, m } = parseMinutes(minutes);

  const parts = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);

  return parts.join(" ");
};
