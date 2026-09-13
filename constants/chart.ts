// 카테고리형(작업 구분용) 팔레트.
// 색맹 시뮬레이션·명도 대비 검증을 통과한 순서라, 순서를 바꾸거나 색을 추가하지 말 것.
// 9개째부터는 새 색을 만들지 않고 "기타"로 접는다
const SERIES_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
] as const;

// "기타" 묶음은 중립 회색으로 둬서 개별 작업과 구분되게 한다.
const OTHERS_COLOR = "#8c8c85";

export const getSeriesColor = (colorIndex: number) =>
  SERIES_COLORS[colorIndex] ?? OTHERS_COLOR;
