import { PeriodSummary, TodoStat, TopStat } from "@/types/statistics";
import {
  formatTimeToKrShort,
  getMostFocused,
  getMostFrequent,
  parseMinutes,
  withRoParticle,
} from "@/utils";
import { CalendarCheck2, Flame, Timer } from "lucide-react";

type PeriodDashboardProps = {
  summary: PeriodSummary;
  allStats: TodoStat[];
};

// 동률이면 "A, B" 로 나열한다.
const joinTasks = (tasks: string[]) => tasks.join(", ");

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold text-white">{children}</strong>
);

// 숫자는 크게, 단위는 작게 — 대시보드가 이끄는 값 하나만 이렇게 쓴다.
const HeroDuration = ({ seconds }: { seconds: number }) => {
  const { h, m } = parseMinutes(Math.floor(seconds / 60));

  if (h === 0 && m === 0)
    return <span className="text-2xl font-bold text-white">1분 미만</span>;

  return (
    <p className="flex items-baseline gap-1 text-white">
      {h > 0 && (
        <>
          <span className="text-4xl font-bold tracking-tight">{h}</span>
          <span className="text-lg text-gray-300">시간</span>
        </>
      )}
      {m > 0 && (
        <>
          <span className="text-4xl font-bold tracking-tight">{m}</span>
          <span className="text-lg text-gray-300">분</span>
        </>
      )}
    </p>
  );
};

// 대표 숫자 옆 빈 가로 공간을 채우는 보조 지표
const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="block text-xs whitespace-nowrap text-gray-400">
      {label}
    </span>
    <span className="font-mono text-lg font-semibold text-white">{value}</span>
  </div>
);

const InsightCard = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex gap-2.5 rounded-md bg-white/5 px-3 py-2.5">
    <span className="mt-1 shrink-0">{icon}</span>
    <p className="text-base leading-relaxed break-keep text-gray-200">
      {children}
    </p>
  </div>
);

// 1위가 없으면(기록이 아예 없으면) 아무것도 그리지 않는다.
type TopCardProps = {
  top: TopStat | null;
};

const FocusedCard = ({ top }: TopCardProps) => {
  if (!top) return null;

  return (
    <InsightCard icon={<Flame size={18} className="text-amber-400" />}>
      가장 몰두한 작업은{" "}
      <Highlight>{withRoParticle(joinTasks(top.tasks))}</Highlight>, 총{" "}
      <Highlight>{formatTimeToKrShort(top.value)}</Highlight> 소요했어요
    </InsightCard>
  );
};

const FrequentCard = ({ top }: TopCardProps) => {
  if (!top) return null;

  return (
    <InsightCard icon={<CalendarCheck2 size={18} className="text-sky-400" />}>
      가장 꾸준히 한 작업은{" "}
      <Highlight>{withRoParticle(joinTasks(top.tasks))}</Highlight>, 총{" "}
      <Highlight>{top.value}일</Highlight> 작업했어요
    </InsightCard>
  );
};

export default function PeriodDashboard({
  summary,
  allStats,
}: PeriodDashboardProps) {
  const { totalElapsed } = summary;

  return (
    <section className="rounded-md bg-gray-800 p-5">
      <h2 className="font-mono text-sm font-bold text-gray-400">Summary</h2>

      {totalElapsed === 0 ? (
        <p className="mt-3 text-base break-keep text-gray-300">
          아직 기록된 작업이 없어요
        </p>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Timer size={24} className="text-blue-300" />
            </span>

            <div className="min-w-0 flex-1">
              <span className="text-xs text-gray-400">총 작업 시간</span>
              <HeroDuration seconds={totalElapsed} />
            </div>

            <div className="flex shrink-0 gap-4 text-right">
              <MiniStat label="작업한 날" value={`${summary.activeDays}일`} />
              <MiniStat label="작업 수" value={`${summary.todoCount}개`} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <FocusedCard top={getMostFocused(allStats)} />
            <FrequentCard top={getMostFrequent(allStats)} />
          </div>
        </>
      )}
    </section>
  );
}
