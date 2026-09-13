import {
  aggregateByTodo,
  buildChartSeries,
  buildStackedBuckets,
  createSeriesIdResolver,
  getBucketUnit,
  getMostFocused,
  getMostFrequent,
  getPeriodRange,
  getTimeAxis,
  shiftPeriod,
  summarizePeriod,
} from "./statistics";

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

describe("shiftPeriod", () => {
  it("입력한 refDate 원본을 변경하지 않는다", () => {
    const input = new Date("2026-07-15T14:30:00Z");
    shiftPeriod("month", input, 1);
    expect(input).toEqual(new Date("2026-07-15T14:30:00Z"));
  });

  it("week은 7일 단위로 이동한다", () => {
    expect(shiftPeriod("week", new Date("2026-07-15"), -1)).toEqual(
      new Date("2026-07-08")
    );
    expect(shiftPeriod("week", new Date("2026-07-15"), 1)).toEqual(
      new Date("2026-07-22")
    );
  });

  it("month는 말일 기준일이어도 다음 달로 넘치지 않는다", () => {
    // 1/31에서 +1은 3/3이 아니라 2월이어야 한다
    const next = shiftPeriod("month", new Date("2026-01-31"), 1);
    expect(getPeriodRange("month", next)).toEqual({
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-02-28"),
    });
  });

  it("year는 1년 단위로 이동한다", () => {
    expect(shiftPeriod("year", new Date("2026-07-15"), -1)).toEqual(
      new Date("2025-01-01")
    );
  });
});

const log = (
  date: string,
  elapsedTime: number,
  todoId = "a",
  task = "공부"
) => ({
  date: new Date(date),
  elapsedTime,
  todoId,
  todo: { task },
});

describe("getBucketUnit", () => {
  const start = new Date("2026-08-01");

  it("주간은 일 단위, 월간은 주 단위, 연간은 월 단위로 끊는다", () => {
    expect(getBucketUnit("week", start, new Date("2026-08-07"))).toBe("day");
    expect(getBucketUnit("month", start, new Date("2026-08-31"))).toBe("week");
    expect(getBucketUnit("year", start, new Date("2026-12-31"))).toBe("month");
  });

  it("직접 설정은 구간 길이로 단위를 정한다", () => {
    expect(getBucketUnit("custom", start, new Date("2026-08-07"))).toBe("day"); // 7일
    expect(getBucketUnit("custom", start, new Date("2026-08-08"))).toBe("week"); // 8일
    expect(getBucketUnit("custom", start, new Date("2026-10-23"))).toBe("week"); // 84일
    expect(getBucketUnit("custom", start, new Date("2026-10-24"))).toBe(
      "month"
    ); // 85일
  });
});

describe("buildStackedBuckets", () => {
  const seriesIdOf = (todoId: string) => todoId;

  it("일 단위: 기록 없는 날도 0으로 채운다", () => {
    const buckets = buildStackedBuckets(
      [log("2026-07-13", 60), log("2026-07-15", 30)],
      new Date("2026-07-13"),
      new Date("2026-07-16"),
      "day",
      seriesIdOf
    );

    expect(buckets.map((b) => b.label)).toEqual([
      "7/13",
      "7/14",
      "7/15",
      "7/16",
    ]);
    expect(buckets.map((b) => b.total)).toEqual([60, 0, 30, 0]);
  });

  it("같은 칸의 여러 작업은 시리즈별로 나눠 담고 total에 합산한다", () => {
    const [bucket] = buildStackedBuckets(
      [log("2026-07-13", 60, "a"), log("2026-07-13", 40, "b", "운동")],
      new Date("2026-07-13"),
      new Date("2026-07-13"),
      "day",
      seriesIdOf
    );

    expect(bucket.total).toBe(100);
    expect(bucket.bySeries).toEqual({ a: 60, b: 40 });
  });

  it("주 단위: 월 경계에서 첫 칸과 마지막 칸이 구간 밖으로 나가지 않는다", () => {
    // 2026-08-01은 토요일 → 첫 주는 8/1~8/2뿐이다
    const buckets = buildStackedBuckets(
      [log("2026-08-01", 10), log("2026-08-31", 20)],
      new Date("2026-08-01"),
      new Date("2026-08-31"),
      "week",
      seriesIdOf
    );

    expect(buckets[0].label).toBe("8/1~8/2");
    expect(buckets[0].total).toBe(10);
    expect(buckets[buckets.length - 1].label).toBe("8/31~8/31");
    expect(buckets[buckets.length - 1].total).toBe(20);
    expect(buckets.at(-1)!.endDate).toEqual(new Date("2026-08-31"));
  });

  it("월 단위: 12칸을 만들고 월별로 합산한다", () => {
    const buckets = buildStackedBuckets(
      [log("2026-01-05", 60), log("2026-01-20", 40), log("2026-03-02", 10)],
      new Date("2026-01-01"),
      new Date("2026-12-31"),
      "month",
      seriesIdOf
    );

    expect(buckets).toHaveLength(12);
    expect(buckets[0].label).toBe("1월");
    expect(buckets[0].total).toBe(100);
    expect(buckets[2].total).toBe(10);
  });

  it("시작일이 종료일보다 뒤면 빈 배열을 반환한다", () => {
    expect(
      buildStackedBuckets(
        [],
        new Date("2026-07-16"),
        new Date("2026-07-13"),
        "day",
        seriesIdOf
      )
    ).toEqual([]);
  });
});

describe("aggregateByTodo", () => {
  it("todo별 소요시간·작업일수를 합산하고 소요시간 내림차순으로 정렬한다", () => {
    const stats = aggregateByTodo([
      log("2026-07-13", 30, "a"),
      log("2026-07-14", 70, "a"),
      log("2026-07-13", 100, "b", "운동"),
    ]);

    expect(stats.map((s) => s.todoId)).toEqual(["a", "b"]);
    expect(stats[0]).toMatchObject({ elapsedTime: 100, activeDays: 2 });
    expect(stats[1]).toMatchObject({ elapsedTime: 100, activeDays: 1 });
    expect(stats[0].ratio).toBe(0.5);
  });

  it("소요시간이 0인 기록은 제외한다", () => {
    const stats = aggregateByTodo([
      log("2026-07-13", 0, "a"),
      log("2026-07-13", 10, "b", "운동"),
    ]);
    expect(stats.map((s) => s.todoId)).toEqual(["b"]);
  });
});

describe("getMostFocused / getMostFrequent", () => {
  // 공부 110초(1일), 운동 100+10초(2일) → 소요시간은 동률, 작업일수는 운동이 앞선다
  const stats = aggregateByTodo([
    log("2026-07-13", 110, "a"),
    log("2026-07-13", 100, "b", "운동"),
    log("2026-07-14", 10, "b", "운동"),
  ]);

  it("소요시간 1위가 동률이면 모두 반환한다", () => {
    expect(getMostFocused(stats)).toEqual({
      tasks: ["공부", "운동"],
      value: 110,
    });
  });

  it("작업일 빈도 1위를 반환한다", () => {
    expect(getMostFrequent(stats)).toEqual({ tasks: ["운동"], value: 2 });
  });

  it("기록이 없으면 null을 반환한다", () => {
    expect(getMostFocused([])).toBeNull();
    expect(getMostFrequent([])).toBeNull();
  });
});

describe("buildChartSeries", () => {
  const makeStats = (count: number) =>
    aggregateByTodo(
      Array.from({ length: count }, (_, i) =>
        log("2026-07-13", (count - i) * 10, `t${i}`, `작업${i}`)
      )
    );

  it("8개까지는 각자 색상 슬롯을 갖는다", () => {
    const series = buildChartSeries(makeStats(8));
    expect(series).toHaveLength(8);
    expect(series.map((s) => s.colorIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("9개째부터는 새 색을 만들지 않고 기타로 접는다", () => {
    const series = buildChartSeries(makeStats(10));
    expect(series).toHaveLength(9);
    expect(series.at(-1)).toMatchObject({
      id: "__others__",
      label: "기타 2개",
      colorIndex: 8,
    });
    expect(series.at(-1)!.todoIds).toEqual(["t8", "t9"]);
  });

  it("기타로 접힌 todo는 기타 시리즈로 해석된다", () => {
    const resolve = createSeriesIdResolver(buildChartSeries(makeStats(10)));
    expect(resolve("t0")).toBe("t0");
    expect(resolve("t9")).toBe("__others__");
  });
});

describe("getTimeAxis", () => {
  it("읽기 쉬운 단위로 끊고 최댓값을 덮는다", () => {
    const { axisMax, ticks } = getTimeAxis(3 * 3600);
    expect(axisMax).toBeGreaterThanOrEqual(3 * 3600);
    expect(ticks[0]).toBe(0);
    expect(ticks.at(-1)).toBe(axisMax);
  });

  it("기록이 없으면 0~1분 축을 준다", () => {
    expect(getTimeAxis(0)).toEqual({ axisMax: 60, ticks: [0, 60] });
  });
});

describe("summarizePeriod", () => {
  it("소요시간이 0인 기록은 빼고, 날짜와 todo는 중복 없이 센다", () => {
    const summary = summarizePeriod([
      log("2026-07-13", 100, "a"),
      log("2026-07-13", 50, "b", "운동"), // 같은 날 다른 todo → 날짜는 1일로
      log("2026-07-15", 90, "a"),
      log("2026-07-16", 0, "a"), // 0초 → 집계에서 제외
    ]);

    expect(summary).toEqual({
      totalElapsed: 240,
      activeDays: 2,
      todoCount: 2,
    });
  });
});
