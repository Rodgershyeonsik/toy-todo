export type Period = "week" | "month" | "year";
export type PeriodMode = Period | "custom";

// 통계 계산에 필요한 최소한의 로그 형태 (DailyLog + todo.task)
export type StatLog = {
  date: Date;
  elapsedTime: number;
  todoId: string;
  todo: { task: string };
};

export type TodoStat = {
  todoId: string;
  task: string;
  elapsedTime: number;
  activeDays: number;
  ratio: number;
};

export type PeriodSummary = {
  totalElapsed: number;
  activeDays: number;
  todoCount: number;
  dailyAverage: number;
};

// 1위 항목들과 그 값. 동률이면 tasks에 여러 개가 담긴다.
export type TopStat = { tasks: string[]; value: number };

export type BucketUnit = "day" | "week" | "month";

// 차트의 가로 막대 한 줄. 기록이 없는 구간도 0인 채로 만들어 둔다.
export type StackedBucket = {
  key: string; // 칸을 구분하는 값 (칸 시작일의 "YYYY-MM-DD")
  label: string; // 축에 표시할 문구 ("8/24", "8/3~8/9", "3월")
  startDate: Date;
  endDate: Date;
  total: number; // 이 칸의 전체 소요시간(초)
  // 시리즈별 소요시간(초).
  // 키는 todoId가 아니라 ChartSeries의 id다 — "기타"로 접힌 todo들은
  // 각자의 id가 아니라 묶음 id 하나에 합산되므로 todoId로 찾으면 안 된다.
  bySeries: Record<string, number>;
};

// 차트에서 색 하나와 범례 한 줄을 배정받는 단위.
// todo 1개당 1개가 기본이지만 색 슬롯(8개)을 넘긴 todo들은 "기타" 하나로 묶이므로,
// 시리즈 개수와 todo 개수가 항상 같지는 않다.
export type ChartSeries = {
  id: string; // 개별 todo의 id이거나, 묶음을 뜻하는 "기타" id
  label: string; // 범례에 표시할 이름 ("운동", "기타 4개")
  todoIds: string[]; // 이 시리즈가 대표하는 todo들 (묶음이면 여러 개)
  colorIndex: number; // 배정된 색 슬롯 번호. 필터를 걸어도 바뀌지 않는다
};
