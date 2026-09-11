import {
  BucketUnit,
  ChartSeries,
  Period,
  PeriodMode,
  PeriodSummary,
  StackedBucket,
  StatLog,
  TodoStat,
  TopStat,
} from "@/types/statistics";

export const getPeriodRange = (
  period: Period,
  refDate: Date
): { startDate: Date; endDate: Date } => {
  const base = new Date(refDate);
  base.setUTCHours(0, 0, 0, 0);

  if (period === "week") {
    const day = base.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;

    const startDate = new Date(base);
    startDate.setUTCDate(startDate.getUTCDate() - diff);

    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);

    return { startDate, endDate };
  }

  if (period === "month") {
    const startDate = new Date(base);
    startDate.setUTCDate(1);

    const endDate = new Date(base);
    endDate.setUTCMonth(base.getUTCMonth() + 1, 0);

    return { startDate, endDate };
  }

  if (period === "year") {
    const startDate = new Date(base);
    startDate.setUTCMonth(0, 1);
    const endDate = new Date(base);
    endDate.setUTCMonth(11, 31);

    return { startDate, endDate };
  }

  throw new Error(`Unknown period: ${period}`);
};

// 기간 이동: 주는 7일, 월/년은 달력 단위로 앞뒤 구간을 계산한다.
export const shiftPeriod = (
  period: Period,
  refDate: Date,
  step: number
): Date => {
  const base = new Date(refDate);
  base.setUTCHours(0, 0, 0, 0);

  if (period === "week") {
    base.setUTCDate(base.getUTCDate() + step * 7);
    return base;
  }

  if (period === "month") {
    // 31일 같은 말일 기준일이 다음 달로 넘치지 않도록 1일로 맞춘 뒤 이동
    base.setUTCDate(1);
    base.setUTCMonth(base.getUTCMonth() + step);
    return base;
  }

  if (period === "year") {
    base.setUTCMonth(0, 1);
    base.setUTCFullYear(base.getUTCFullYear() + step);
    return base;
  }

  throw new Error(`Unknown period: ${period}`);
};

export const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

// "YYYY-MM-DD"(date input 값)를 로그 저장 규칙과 같은 UTC 자정 Date로 되돌린다.
export const fromDateKey = (key: string) => new Date(`${key}T00:00:00.000Z`);

const DAY_MS = 24 * 60 * 60 * 1000;

// todo별 총 소요시간·작업일수·비중을 소요시간 내림차순으로 반환한다.
export const aggregateByTodo = (logs: StatLog[]): TodoStat[] => {
  const totals = new Map<string, TodoStat & { dates: Set<string> }>();

  logs.forEach((log) => {
    if (log.elapsedTime <= 0) return;

    const prev = totals.get(log.todoId);
    const dateKey = toDateKey(new Date(log.date));

    if (prev) {
      prev.elapsedTime += log.elapsedTime;
      prev.dates.add(dateKey);
    } else {
      totals.set(log.todoId, {
        todoId: log.todoId,
        task: log.todo.task,
        elapsedTime: log.elapsedTime,
        activeDays: 0,
        ratio: 0,
        dates: new Set([dateKey]),
      });
    }
  });

  const stats = [...totals.values()].sort(
    // 동률이면 이름순으로 고정해서 렌더링 순서(=색상 배정)가 흔들리지 않게 한다.
    (a, b) => b.elapsedTime - a.elapsedTime || a.task.localeCompare(b.task)
  );

  const total = stats.reduce((acc, cur) => acc + cur.elapsedTime, 0);

  return stats.map(({ dates, ...stat }) => ({
    ...stat,
    activeDays: dates.size,
    ratio: total === 0 ? 0 : stat.elapsedTime / total,
  }));
};

export const summarizePeriod = (logs: StatLog[]): PeriodSummary => {
  const worked = logs.filter((log) => log.elapsedTime > 0);
  const totalElapsed = worked.reduce((acc, log) => acc + log.elapsedTime, 0);
  // 평균은 기록이 아예 없는 날을 빼고, 실제로 작업한 날 기준으로 낸다.
  const activeDays = new Set(worked.map((log) => toDateKey(new Date(log.date))))
    .size;

  return {
    totalElapsed,
    activeDays,
    todoCount: new Set(worked.map((log) => log.todoId)).size,
    dailyAverage: activeDays === 0 ? 0 : Math.round(totalElapsed / activeDays),
  };
};

// 1위가 여럿이면 모두 돌려준다(동률 표시 요구사항).
const pickTop = (
  stats: TodoStat[],
  getValue: (stat: TodoStat) => number
): TopStat | null => {
  if (stats.length === 0) return null;

  const max = Math.max(...stats.map(getValue));
  if (max <= 0) return null;

  return {
    tasks: stats.filter((stat) => getValue(stat) === max).map((s) => s.task),
    value: max,
  };
};

// 소요시간이 가장 큰 작업
export const getMostFocused = (stats: TodoStat[]) =>
  pickTop(stats, (stat) => stat.elapsedTime);

// 작업일 빈도가 가장 높은 작업
export const getMostFrequent = (stats: TodoStat[]) =>
  pickTop(stats, (stat) => stat.activeDays);

// 주간은 일 단위, 월간은 주 단위, 연간은 월 단위. 직접 설정은 구간 길이로 정한다.
export const getBucketUnit = (
  mode: PeriodMode,
  startDate: Date,
  endDate: Date
): BucketUnit => {
  if (mode === "week") return "day";
  if (mode === "month") return "week";
  if (mode === "year") return "month";

  const days = (endDate.getTime() - startDate.getTime()) / DAY_MS + 1;
  if (days <= 7) return "day";
  if (days <= 84) return "week";
  return "month";
};

const formatMonthDay = (date: Date) =>
  `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;

// cursor가 속한 버킷의 마지막 날 (구간 끝으로 잘라내기 전 값)
const getBucketEnd = (unit: BucketUnit, cursor: Date) => {
  if (unit === "day") return new Date(cursor);

  if (unit === "week") return getPeriodRange("week", cursor).endDate;

  const end = new Date(cursor);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  return end;
};

const getBucketLabel = (unit: BucketUnit, start: Date, end: Date) => {
  if (unit === "day") return formatMonthDay(start);
  if (unit === "month") return `${start.getUTCMonth() + 1}월`;
  return `${formatMonthDay(start)}~${formatMonthDay(end)}`;
};

// 기록이 없는 칸도 0으로 채워서 구간 전체를 빠짐없이 그린다.
export const buildStackedBuckets = (
  logs: StatLog[],
  startDate: Date,
  endDate: Date,
  unit: BucketUnit,
  seriesIdOf: (todoId: string) => string
): StackedBucket[] => {
  const buckets: StackedBucket[] = [];
  const cursor = new Date(startDate);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor.getTime() <= endDate.getTime()) {
    const rawEnd = getBucketEnd(unit, cursor);
    // 마지막 버킷은 구간 밖으로 삐져나가지 않게 자른다.
    const bucketEnd =
      rawEnd.getTime() > endDate.getTime() ? new Date(endDate) : rawEnd;

    buckets.push({
      key: toDateKey(cursor),
      label: getBucketLabel(unit, cursor, bucketEnd),
      startDate: new Date(cursor),
      endDate: bucketEnd,
      total: 0,
      bySeries: {},
    });

    cursor.setTime(bucketEnd.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  logs.forEach((log) => {
    if (log.elapsedTime <= 0) return;

    const time = new Date(log.date).getTime();
    const bucket = buckets.find(
      (b) => time >= b.startDate.getTime() && time <= b.endDate.getTime()
    );
    if (!bucket) return;

    const seriesId = seriesIdOf(log.todoId);
    bucket.bySeries[seriesId] =
      (bucket.bySeries[seriesId] ?? 0) + log.elapsedTime;
    bucket.total += log.elapsedTime;
  });

  return buckets;
};

// 색상 슬롯은 8개까지만 쓰고, 그 뒤는 "기타"로 접는다.
const MAX_COLOR_SLOTS = 8;
const OTHERS_SERIES_ID = "__others__";

// 색상은 필터와 무관하게 "기간 전체 기준"으로 한 번만 배정한다.
// (필터를 걸었다고 살아남은 작업의 색이 바뀌면 안 된다)
export const buildChartSeries = (stats: TodoStat[]): ChartSeries[] => {
  const head = stats.slice(0, MAX_COLOR_SLOTS).map((stat, idx) => ({
    id: stat.todoId,
    label: stat.task,
    todoIds: [stat.todoId],
    colorIndex: idx,
  }));

  const tail = stats.slice(MAX_COLOR_SLOTS);
  if (tail.length === 0) return head;

  return [
    ...head,
    {
      id: OTHERS_SERIES_ID,
      label: `기타 ${tail.length}개`,
      todoIds: tail.map((stat) => stat.todoId),
      colorIndex: MAX_COLOR_SLOTS,
    },
  ];
};

export const createSeriesIdResolver = (series: ChartSeries[]) => {
  const byTodoId = new Map<string, string>();
  series.forEach((s) => s.todoIds.forEach((id) => byTodoId.set(id, s.id)));

  return (todoId: string) => byTodoId.get(todoId) ?? OTHERS_SERIES_ID;
};

const formatDateKR = (date: Date) =>
  `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getUTCDate()).padStart(2, "0")}`;

export const formatPeriodLabel = (
  mode: PeriodMode,
  startDate: Date,
  endDate: Date
) => {
  if (mode === "month")
    return `${startDate.getUTCFullYear()}년 ${startDate.getUTCMonth() + 1}월`;

  if (mode === "year") return `${startDate.getUTCFullYear()}년`;

  return `${formatDateKR(startDate)} ~ ${formatDateKR(endDate)}`;
};

// 축 눈금은 60초/5분/1시간처럼 읽기 쉬운 단위로만 끊는다.
const NICE_TIME_STEPS = [
  60, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800,
  604800,
];
const TARGET_TICK_COUNT = 4;

export const getTimeAxis = (maxValue: number) => {
  if (maxValue <= 0) return { axisMax: 60, ticks: [0, 60] };

  const step =
    NICE_TIME_STEPS.find((s) => maxValue / s <= TARGET_TICK_COUNT) ??
    NICE_TIME_STEPS[NICE_TIME_STEPS.length - 1];

  const axisMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= axisMax; tick += step) ticks.push(tick);

  return { axisMax, ticks };
};
