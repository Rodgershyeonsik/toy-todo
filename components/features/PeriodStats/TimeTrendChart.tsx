import { getSeriesColor } from "@/constants/chart";
import { flexBetweenCn } from "@/constants/styles";
import {
  BucketUnit,
  ChartSeries,
  StackedBucket,
} from "@/types/statistics";
import { cn, formatTimeToEnShort, formatTimeToKr, getTimeAxis } from "@/utils";
import { useState } from "react";

type TimeTrendChartProps = {
  buckets: StackedBucket[];
  series: ChartSeries[];
  unit: BucketUnit;
};

const UNIT_LABELS: Record<BucketUnit, string> = {
  day: "일 단위",
  week: "주 단위",
  month: "월 단위",
};

// 세그먼트 사이 2px 흰 간격이 경계선 역할을 한다(테두리를 그리지 않는다).
const SEGMENT_GAP = 2;
// 구간 라벨과 합계 라벨이 차지하는 고정 폭. 눈금선·눈금값도 같은 폭을 비켜간다.
const LABEL_W = "68px";
const VALUE_W = "52px";

type HoverTarget = {
  bucketKey: string;
  seriesId: string;
  label: string;
  value: number;
  centerPct: number;
};

export default function TimeTrendChart({
  buckets,
  series,
  unit,
}: TimeTrendChartProps) {
  const [hovered, setHovered] = useState<HoverTarget | null>(null);

  const maxTotal = Math.max(...buckets.map((bucket) => bucket.total), 0);
  const { axisMax, ticks } = getTimeAxis(maxTotal);

  return (
    <section className="rounded-md border border-gray-200 bg-white p-4">
      <div className={flexBetweenCn}>
        <h2 className="font-mono text-sm font-bold text-gray-500">
          Time Trend
        </h2>
        <span className="font-mono text-xs text-gray-400">
          {UNIT_LABELS[unit]}
        </span>
      </div>

      {/* 색상만으로 작업을 구분하게 두지 않도록 범례는 항상 같이 둔다 */}
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-xs"
              style={{ backgroundColor: getSeriesColor(s.colorIndex) }}
            />
            <span className="text-xs text-gray-600">{s.label}</span>
          </li>
        ))}
      </ul>

      {maxTotal === 0 ? (
        <p className="mt-6 mb-2 text-center text-sm text-gray-500">
          선택한 작업의 기록이 없어요
        </p>
      ) : (
        <>
          <div className="relative mt-6">
            {/* 눈금선은 막대 뒤에 깔리는 배경이라 데이터보다 흐리게 둔다 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0"
              style={{ left: LABEL_W, right: VALUE_W }}
            >
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{ left: `${(tick / axisMax) * 100}%` }}
                />
              ))}
            </div>

            <ul className="relative space-y-1.5">
              {buckets.map((bucket) => (
                <BucketRow
                  key={bucket.key}
                  bucket={bucket}
                  series={series}
                  axisMax={axisMax}
                  hovered={hovered}
                  onHover={setHovered}
                />
              ))}
            </ul>
          </div>

          <div
            className="relative mt-1 h-4"
            style={{ marginLeft: LABEL_W, marginRight: VALUE_W }}
          >
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute -translate-x-1/2 font-mono text-[10px] tabular-nums text-gray-400"
                style={{ left: `${(tick / axisMax) * 100}%` }}
              >
                {tick === 0 ? "0" : formatTimeToEnShort(tick)}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

type BucketRowProps = {
  bucket: StackedBucket;
  series: ChartSeries[];
  axisMax: number;
  hovered: HoverTarget | null;
  onHover: (target: HoverTarget | null) => void;
};

function BucketRow({
  bucket,
  series,
  axisMax,
  hovered,
  onHover,
}: BucketRowProps) {
  const drawn = series
    .map((s) => ({ series: s, value: bucket.bySeries[s.id] ?? 0 }))
    .filter((segment) => segment.value > 0);

  // 앞선 세그먼트들의 폭을 더해 시작 위치를 잡는다(툴팁을 세그먼트 가운데에 두려고).
  const segments = drawn.map((segment, idx) => ({
    ...segment,
    widthPct: (segment.value / axisMax) * 100,
    offsetPct: drawn
      .slice(0, idx)
      .reduce((acc, prev) => acc + (prev.value / axisMax) * 100, 0),
  }));

  return (
    <li className="relative flex items-center">
      <span
        className="shrink-0 pr-2 text-right font-mono text-[10px] text-gray-500"
        style={{ width: LABEL_W }}
      >
        {bucket.label}
      </span>

      <div
        className="relative flex h-5 flex-1 items-stretch"
        style={{ gap: `${SEGMENT_GAP}px` }}
      >
        {segments.map(({ series: s, value, widthPct, offsetPct }, idx) => {
          // 툴팁이 카드 밖으로 나가지 않게 가장자리는 살짝 당겨둔다.
          const centerPct = Math.min(
            Math.max(offsetPct + widthPct / 2, 10),
            90
          );

          const isHovered =
            hovered?.bucketKey === bucket.key && hovered?.seriesId === s.id;
          const target: HoverTarget = {
            bucketKey: bucket.key,
            seriesId: s.id,
            label: s.label,
            value,
            centerPct,
          };

          return (
            <div
              key={s.id}
              tabIndex={0}
              aria-label={`${bucket.label} ${s.label} ${formatTimeToKr(value)}`}
              onMouseEnter={() => onHover(target)}
              onFocus={() => onHover(target)}
              onMouseLeave={() => onHover(null)}
              onBlur={() => onHover(null)}
              className={cn(
                "h-full outline-none transition-opacity",
                // 데이터가 끝나는 쪽만 둥글게, 기준선 쪽은 각지게
                idx === segments.length - 1 && "rounded-r-sm",
                isHovered && "opacity-75"
              )}
              style={{
                width: `${widthPct}%`,
                backgroundColor: getSeriesColor(s.colorIndex),
              }}
            />
          );
        })}

        {hovered?.bucketKey === bucket.key && (
          <Tooltip
            label={hovered.label}
            value={hovered.value}
            centerPct={hovered.centerPct}
          />
        )}
      </div>

      {/* 호버 없이도 값을 읽을 수 있게 칸 합계는 늘 보이게 둔다 */}
      <span
        className="shrink-0 pl-1.5 text-right font-mono text-[10px] tabular-nums text-gray-500"
        style={{ width: VALUE_W }}
      >
        {bucket.total > 0 ? formatTimeToEnShort(bucket.total) : ""}
      </span>
    </li>
  );
}

const Tooltip = ({
  label,
  value,
  centerPct,
}: {
  label: string;
  value: number;
  centerPct: number;
}) => (
  <div
    role="tooltip"
    className="pointer-events-none absolute bottom-full z-10 mb-1 -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 whitespace-nowrap shadow-md"
    style={{ left: `${centerPct}%` }}
  >
    {/* 값이 먼저, 작업 이름은 보조 */}
    <span className="font-mono text-xs font-semibold text-white">
      {formatTimeToKr(value)}
    </span>
    <span className="ml-1.5 text-[10px] text-gray-300">{label}</span>
  </div>
);
