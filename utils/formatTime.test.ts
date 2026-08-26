import { formatMinutesToEn, formatTimeToEnShort } from "./formatTime";

describe("formatMinutesToEn", () => {
  it("60분이 주어지면 1h을 반환한다", () => {
    expect(formatMinutesToEn(60)).toBe("1h");
  });
});

describe("formatMinutesToEn", () => {
  it("시와 분이 모두 있으면 둘 다 표기한다", () => {
    expect(formatMinutesToEn(90)).toBe("1h 30m");
  });

  it("분만 있으면 분만 표기한다", () => {
    expect(formatMinutesToEn(30)).toBe("30m");
  });

  it("0분이면 0m을 반환한다", () => {
    expect(formatMinutesToEn(0)).toBe("0m");
  });
});

describe("formatTimeToEnShort", () => {
  it("초는 버리고 시·분까지만 표기한다", () => {
    expect(formatTimeToEnShort(23445)).toBe("6h 30m"); // 6h 30m 45s
    expect(formatTimeToEnShort(2115)).toBe("35m"); // 35m 15s
  });

  it("1분 미만은 0m으로 뭉개지 않고 초를 살린다", () => {
    expect(formatTimeToEnShort(45)).toBe("45s");
    expect(formatTimeToEnShort(59)).toBe("59s");
  });

  it("정확히 1분부터는 분 표기로 넘어간다", () => {
    expect(formatTimeToEnShort(60)).toBe("1m");
  });

  it("0초면 0s를 반환한다", () => {
    expect(formatTimeToEnShort(0)).toBe("0s");
  });
});
