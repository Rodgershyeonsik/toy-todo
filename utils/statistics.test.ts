import { getPeriodRange } from "./statistics";

describe("getPeriodRange", () => {
  it("입력한 refDate 원본을 변경하지 않는다", () => {
    const input = new Date("2026-07-15T14:30:00Z");
    getPeriodRange("week", input);
    expect(input).toEqual(new Date("2026-07-15T14:30:00Z")); // 그대로여야 함
  });

  describe("week (월요일 시작 ~ 일요일 끝)", () => {
    it("평일(수)이 기준일이면 그 주 월~일을 반환한다", () => {
      // 2026-07-15는 수요일
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2026-07-15")
      );
      expect(startDate).toEqual(new Date("2026-07-13")); // 월
      expect(endDate).toEqual(new Date("2026-07-19")); // 일
    });

    it("월요일(주 시작)이 기준일이면 그날이 시작이 된다", () => {
      // 2026-07-13은 월요일
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2026-07-13")
      );
      expect(startDate).toEqual(new Date("2026-07-13"));
      expect(endDate).toEqual(new Date("2026-07-19"));
    });

    it("일요일(주 끝)이 기준일이어도 같은 주 월요일이 시작이 된다", () => {
      // 2026-07-19는 일요일. getUTCDay()가 0이라 보정이 필요한 케이스
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2026-07-19")
      );
      expect(startDate).toEqual(new Date("2026-07-13"));
      expect(endDate).toEqual(new Date("2026-07-19"));
    });

    it("주가 월 경계를 넘어가면 이전 달로 시작이 넘어간다", () => {
      // 2026-08-01은 토요일. 그 주는 07-27(월) ~ 08-02(일)
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2026-08-01")
      );
      expect(startDate).toEqual(new Date("2026-07-27"));
      expect(endDate).toEqual(new Date("2026-08-02"));
    });

    it("주가 연 경계를 넘어가면 이전 해로 시작이 넘어간다", () => {
      // 2027-01-01은 금요일. 그 주는 2026-12-28(월) ~ 2027-01-03(일)
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2027-01-01")
      );
      expect(startDate).toEqual(new Date("2026-12-28"));
      expect(endDate).toEqual(new Date("2027-01-03"));
    });

    it("기준일에 시각이 있어도 자정(00:00:00)으로 정규화한다", () => {
      // 2026-07-15T14:30:00Z(수) → 시각을 버리고 그 주 월/일 자정
      const { startDate, endDate } = getPeriodRange(
        "week",
        new Date("2026-07-15T14:30:00Z")
      );
      expect(startDate).toEqual(new Date("2026-07-13"));
      expect(endDate).toEqual(new Date("2026-07-19"));
    });
  });

  // 다음 그룹 — 구현 순서대로 채울 예정
  describe("month (1일 ~ 말일)", () => {
    it("월 중간이 기준이면 1일, 말일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "month",
        new Date("2026-07-15")
      );
      expect(startDate).toEqual(new Date("2026-07-01"));
      expect(endDate).toEqual(new Date("2026-07-31"));
    });

    it("1일이 기준이면 기준일, 말일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "month",
        new Date("2026-04-01")
      );
      expect(startDate).toEqual(new Date("2026-04-01"));
      expect(endDate).toEqual(new Date("2026-04-30"));
    });

    it("말일이 기준이면 1일, 기준일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "month",
        new Date("2026-06-30")
      );
      expect(startDate).toEqual(new Date("2026-06-01"));
      expect(endDate).toEqual(new Date("2026-06-30"));
    });

    it("평년 2월 중간이 기준일이면, 1일, 28일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "month",
        new Date("2026-02-14")
      );
      expect(startDate).toEqual(new Date("2026-02-01"));
      expect(endDate).toEqual(new Date("2026-02-28"));
    });

    it("윤년 2월 중간이 기준일이면, 1일, 29일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "month",
        new Date("2024-02-14")
      );
      expect(startDate).toEqual(new Date("2024-02-01"));
      expect(endDate).toEqual(new Date("2024-02-29"));
    });
  });

  describe("year (1/1 ~ 12/31)", () => {
    it("기준일 연도의 1월 1일, 12월 31일을 반환한다", () => {
      const { startDate, endDate } = getPeriodRange(
        "year",
        new Date("2026-07-19")
      );
      expect(startDate).toEqual(new Date("2026-01-01"));
      expect(endDate).toEqual(new Date("2026-12-31"));
    });
  });
});
