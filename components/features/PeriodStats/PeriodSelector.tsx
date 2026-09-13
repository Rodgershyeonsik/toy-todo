import { basicButtonCn, flexBetweenCn } from "@/constants/styles";
import { PeriodMode } from "@/types/statistics";
import { cn } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MODE_LABELS: { mode: PeriodMode; label: string }[] = [
  { mode: "week", label: "Week" },
  { mode: "month", label: "Month" },
  { mode: "year", label: "Year" },
  { mode: "custom", label: "Custom" },
];

type PeriodSelectorProps = {
  mode: PeriodMode;
  rangeLabel: string;
  customStart: string;
  customEnd: string;
  canGoNext: boolean;
  onModeChange: (mode: PeriodMode) => void;
  onShift: (step: number) => void;
  onCustomChange: (key: "start" | "end", value: string) => void;
};

const dateInputCn =
  "flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none";

export default function PeriodSelector({
  mode,
  rangeLabel,
  customStart,
  customEnd,
  canGoNext,
  onModeChange,
  onShift,
  onCustomChange,
}: PeriodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {MODE_LABELS.map((item) => (
          <button
            key={item.mode}
            type="button"
            onClick={() => onModeChange(item.mode)}
            className={cn(
              basicButtonCn,
              "flex-1 text-sm cursor-pointer",
              mode === item.mode
                ? "border-blue-500 bg-blue-400 text-white"
                : "border-gray-200 bg-gray-100 text-gray-600 hover:bg-black/10"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "custom" ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            max={customEnd}
            onChange={(e) => onCustomChange("start", e.target.value)}
            className={dateInputCn}
          />
          <span className="text-gray-400">~</span>
          <input
            type="date"
            value={customEnd}
            min={customStart}
            onChange={(e) => onCustomChange("end", e.target.value)}
            className={dateInputCn}
          />
        </div>
      ) : (
        <div className={cn(flexBetweenCn, "rounded-md bg-gray-100 px-2 py-1")}>
          <button
            type="button"
            aria-label="이전 구간"
            onClick={() => onShift(-1)}
            className="p-1 text-gray-500 hover:text-blue-500 cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-mono font-semibold text-gray-700">
            {rangeLabel}
          </span>
          <button
            type="button"
            aria-label="다음 구간"
            disabled={!canGoNext}
            onClick={() => onShift(1)}
            className={cn(
              "p-1 text-gray-500 hover:text-blue-500 cursor-pointer",
              !canGoNext && "cursor-not-allowed text-gray-300 hover:text-gray-300"
            )}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
