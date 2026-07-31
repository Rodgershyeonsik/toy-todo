import { getTodayInKST } from "./date";

describe("getTodayInKST", () => {
  it("UTC 23:59:59는 KST로 다음날이므로 2026-07-31 자정을 반환한다", () => {
    const result = getTodayInKST(new Date("2026-07-30T23:59:59Z"));
    expect(result).toEqual(new Date("2026-07-31T00:00:00Z"));
  });

  it("UTC 15:00:00(=KST 자정)은 2026-07-31 자정을 반환한다", () => {
    const result = getTodayInKST(new Date("2026-07-30T15:00:00Z"));
    expect(result).toEqual(new Date("2026-07-31T00:00:00Z"));
  });

  it("UTC 14:59:59(=KST 23:59:59)은 2026-07-30 자정을 반환한다", () => {
    const result = getTodayInKST(new Date("2026-07-30T14:59:59Z"));
    expect(result).toEqual(new Date("2026-07-30T00:00:00Z"));
  });

  it("입력한 date 원본을 변경하지 않는다", () => {
    const input = new Date("2026-07-30T23:59:59Z");
    getTodayInKST(input);
    expect(input).toEqual(new Date("2026-07-30T23:59:59Z")); // 그대로여야 함
  });

  it("인자를 생략하면 현재 시각(KST)을 기준으로 반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T15:00:00Z")); // KST 자정
    expect(getTodayInKST()).toEqual(new Date("2026-07-31T00:00:00Z"));
    vi.useRealTimers();
  });

  it("월 경계를 넘기면 다음 달 1일을 반환한다", () => {
    // UTC 07-31 15:00 = KST 08-01 00:00
    const result = getTodayInKST(new Date("2026-07-31T15:00:00Z"));
    expect(result).toEqual(new Date("2026-08-01T00:00:00Z"));
  });

  it("연 경계를 넘기면 다음 해 1월 1일을 반환한다", () => {
    // UTC 12-31 15:00 = KST 다음해 01-01 00:00
    const result = getTodayInKST(new Date("2026-12-31T15:00:00Z"));
    expect(result).toEqual(new Date("2027-01-01T00:00:00Z"));
  });
});
