"use client";

import PeriodDashboard from "@/components/features/PeriodStats/PeriodDashboard";
import PeriodSelector from "@/components/features/PeriodStats/PeriodSelector";
import TimeTrendChart from "@/components/features/PeriodStats/TimeTrendChart";
import TodoFilter from "@/components/features/PeriodStats/TodoFilter";
import { flexCenterCn } from "@/constants/styles";
import { useAuth } from "@/hooks/useAuth";
import { usePeriodStats } from "@/hooks/usePeriodStats";
import useUserStore from "@/store/useUserStore";
import { PeriodMode } from "@/types/statistics";
import {
  aggregateByTodo,
  buildChartSeries,
  buildStackedBuckets,
  cn,
  createSeriesIdResolver,
  formatPeriodLabel,
  fromDateKey,
  getBucketUnit,
  getPeriodRange,
  getTodayInKST,
  shiftPeriod,
  summarizePeriod,
  toDateKey,
} from "@/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function StatsPage() {
  const { isLoading: userIsLoading } = useAuth();
  const user = useUserStore((state) => state.user);

  const today = useMemo(() => getTodayInKST(), []);
  const [mode, setMode] = useState<PeriodMode>("week");
  // 주/월/년은 이 기준일로 구간을 계산하고, 화살표로 앞뒤 구간을 옮긴다.
  const [refDate, setRefDate] = useState<Date>(today);
  const [customRange, setCustomRange] = useState(() => {
    const { startDate, endDate } = getPeriodRange("week", today);
    return { start: toDateKey(startDate), end: toDateKey(endDate) };
  });

  const { startDate, endDate } = useMemo(() => {
    if (mode === "custom")
      return {
        startDate: fromDateKey(customRange.start),
        endDate: fromDateKey(customRange.end),
      };

    return getPeriodRange(mode, refDate);
  }, [mode, refDate, customRange]);

  const { data, isLoading, isError, isValidRange } = usePeriodStats(
    startDate,
    endDate
  );

  const logs = useMemo(() => data?.data ?? [], [data]);
  // 대시보드와 색상 배정은 필터와 무관하게 항상 "기간 전체" 기준이다.
  const allStats = useMemo(() => aggregateByTodo(logs), [logs]);
  const summary = useMemo(() => summarizePeriod(logs), [logs]);
  const series = useMemo(() => buildChartSeries(allStats), [allStats]);
  const colorIndexOf = useMemo(() => {
    const byTodoId = new Map<string, number>();
    series.forEach((s) =>
      s.todoIds.forEach((id) => byTodoId.set(id, s.colorIndex))
    );
    return (todoId: string) => byTodoId.get(todoId) ?? series.length;
  }, [series]);

  // 구간이 바뀌면 선택 목록도 달라지므로, 그 구간에 대한 선택이 아직 없으면 전체 선택으로 본다.
  const rangeKey = `${toDateKey(startDate)}~${toDateKey(endDate)}`;
  const [selection, setSelection] = useState<{
    rangeKey: string;
    ids: string[];
  } | null>(null);
  const candidateIds = useMemo(
    () => allStats.map((stat) => stat.todoId),
    [allStats]
  );
  const selectedIds =
    selection?.rangeKey === rangeKey ? selection.ids : candidateIds;

  const updateSelection = (ids: string[]) => setSelection({ rangeKey, ids });

  const handleToggle = (todoId: string) =>
    updateSelection(
      selectedIds.includes(todoId)
        ? selectedIds.filter((id) => id !== todoId)
        : [...selectedIds, todoId]
    );

  const unit = getBucketUnit(mode, startDate, endDate);
  const buckets = useMemo(() => {
    const seriesIdOf = createSeriesIdResolver(series);
    const filtered = logs.filter((log) => selectedIds.includes(log.todoId));

    return buildStackedBuckets(filtered, startDate, endDate, unit, seriesIdOf);
  }, [logs, selectedIds, startDate, endDate, unit, series]);

  // 필터로 사라진 작업은 범례에서도 빼되, 남은 작업의 색은 그대로 유지한다.
  const visibleSeries = useMemo(
    () =>
      series.filter((s) =>
        buckets.some((bucket) => (bucket.bySeries[s.id] ?? 0) > 0)
      ),
    [series, buckets]
  );

  const rangeLabel = formatPeriodLabel(mode, startDate, endDate);
  // 미래 구간은 볼 게 없으므로 오늘이 포함된 구간에서 멈춘다.
  const canGoNext = mode !== "custom" && endDate.getTime() < today.getTime();

  const handleModeChange = (next: PeriodMode) => {
    setMode(next);
    // 다른 구간으로 옮겨둔 상태에서 탭을 바꾸면 오늘 기준으로 되돌린다.
    if (next !== "custom") setRefDate(today);
  };

  const handleShift = (step: number) => {
    if (mode === "custom") return;
    setRefDate((prev) => shiftPeriod(mode, prev, step));
  };

  const handleCustomChange = (key: "start" | "end", value: string) => {
    if (!value) return;
    setCustomRange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen justify-center">
      <div className="w-full max-w-lg px-6 py-5">
        <header className="space-y-4">
          <Link
            href="/"
            aria-label="홈으로"
            className="inline-flex text-gray-400 hover:text-blue-400"
          >
            <ChevronLeft size={28} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold">작업 통계</h1>
            <span className="text-sm text-gray-500">
              기간별 할 일 소요시간을 확인해보자
            </span>
          </div>

          <PeriodSelector
            mode={mode}
            rangeLabel={rangeLabel}
            customStart={customRange.start}
            customEnd={customRange.end}
            canGoNext={canGoNext}
            onModeChange={handleModeChange}
            onShift={handleShift}
            onCustomChange={handleCustomChange}
          />
        </header>

        <main className="mt-5">
          <StatsContent
            isUserLoading={userIsLoading}
            hasUser={!!user}
            isValidRange={isValidRange}
            isLoading={isLoading}
            isError={isError}
          >
            <div className="space-y-3">
              <PeriodDashboard summary={summary} allStats={allStats} />
              <TodoFilter
                stats={allStats}
                colorIndexOf={colorIndexOf}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={() => updateSelection(candidateIds)}
                onClearAll={() => updateSelection([])}
              />
              <TimeTrendChart
                buckets={buckets}
                series={visibleSeries}
                unit={unit}
              />
            </div>
          </StatsContent>
        </main>
      </div>
    </div>
  );
}

type StatsContentProps = {
  isUserLoading: boolean;
  hasUser: boolean;
  isValidRange: boolean;
  isLoading: boolean;
  isError: boolean;
  children: React.ReactNode;
};

const messageCn = "text-center text-gray-500 whitespace-pre-line";

function StatsContent({
  isUserLoading,
  hasUser,
  isValidRange,
  isLoading,
  isError,
  children,
}: StatsContentProps) {
  if (isUserLoading || isLoading)
    return (
      <div className={cn(flexCenterCn, "h-60")}>
        <span>LOADING...</span>
      </div>
    );

  // 기간 통계는 서버에 쌓인 daily log만 쓰기 때문에 비로그인 상태에선 보여줄 게 없다.
  if (!hasUser)
    return (
      <div className={cn(flexCenterCn, "h-60")}>
        <span className={messageCn}>
          {"작업 통계는 로그인 후 이용할 수 있어요.\n홈에서 로그인해주세요."}
        </span>
      </div>
    );

  if (!isValidRange)
    return (
      <div className={cn(flexCenterCn, "h-60")}>
        <span className={messageCn}>
          시작일이 종료일보다 뒤예요.{"\n"}기간을 다시 설정해주세요.
        </span>
      </div>
    );

  if (isError)
    return (
      <div className={cn(flexCenterCn, "h-60")}>
        <span className={messageCn}>
          데이터 불러오기 실패{"\n"}다시 시도해주세요
        </span>
      </div>
    );

  return <>{children}</>;
}
