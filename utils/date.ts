// 로그의 날짜는 한국 달력 기준 하루로 버킷팅한다.
// (KST 자정~오전9시가 UTC로는 전날이라, UTC로 자르면 두 날이 한 칸에 뭉개짐)
export function getTodayInKST(date?: Date) {
  const today = date ?? new Date();
  const kst = new Date(today.getTime() + 9 * 60 * 60 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return kst;
}
