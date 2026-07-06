import { formatMinutesToEn } from "./formatTime";

describe("formatMinutesToEn", () => {
  it("60분이 주어지면 1h을 반환한다", () => {
    expect(formatMinutesToEn(60)).toBe("1h");
  });
});
