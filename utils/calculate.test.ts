import { getCompletionRate } from "./calculate";

describe("getCompletionRate", () => {
  it("경과 시간이 목표의 절반이면 50을 반환한다", () => {
    const result = getCompletionRate(30, 1);
    expect(result).toBe(50);
  });

  it("목표를 정확히 달성하면 100을 반환한다", () => {
    expect(getCompletionRate(120, 2)).toBe(100);
  });

  it("아무것도 안 했으면 0을 반환한다", () => {
    expect(getCompletionRate(0, 10)).toBe(0);
  });

  it("소수점은 내림 처리한다 (Math.floor)", () => {
    expect(getCompletionRate(100, 3)).toBe(55);
  });
});
