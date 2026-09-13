import { getSeriesColor } from "@/constants/chart";
import { flexBetweenCn } from "@/constants/styles";
import { TodoStat } from "@/types/statistics";
import { cn, formatTimeToEnShort } from "@/utils";
import { Check } from "lucide-react";

type TodoFilterProps = {
  stats: TodoStat[];
  colorIndexOf: (todoId: string) => number;
  selectedIds: string[];
  onToggle: (todoId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

const actionCn =
  "rounded-md border border-gray-200 px-2 py-1 font-mono text-xs text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40";

export default function TodoFilter({
  stats,
  colorIndexOf,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: TodoFilterProps) {
  const isAllSelected = selectedIds.length === stats.length;

  return (
    <section className="rounded-md border border-gray-200 bg-white p-4">
      <div className={flexBetweenCn}>
        <h2 className="font-mono text-sm font-bold text-gray-500">
          Todo Filter
          <span className="ml-2 font-sans font-normal text-gray-400">
            {selectedIds.length}/{stats.length}
          </span>
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className={actionCn}
            disabled={isAllSelected}
            onClick={onSelectAll}
          >
            전체 선택
          </button>
          <button
            type="button"
            className={actionCn}
            disabled={selectedIds.length === 0}
            onClick={onClearAll}
          >
            전체 해제
          </button>
        </div>
      </div>

      {stats.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          이 기간에 기록된 작업이 없어요
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {stats.map((stat) => {
            const isSelected = selectedIds.includes(stat.todoId);

            return (
              <li key={stat.todoId}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(stat.todoId)}
                  className={cn(
                    "flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-colors cursor-pointer",
                    isSelected
                      ? "border-gray-300 bg-gray-100 text-gray-800"
                      : "border-gray-200 bg-white text-gray-400"
                  )}
                >
                  <span
                    aria-hidden
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? getSeriesColor(colorIndexOf(stat.todoId))
                        : "transparent",
                      boxShadow: isSelected
                        ? undefined
                        : `inset 0 0 0 1.5px ${getSeriesColor(
                            colorIndexOf(stat.todoId)
                          )}`,
                    }}
                  >
                    {isSelected && (
                      <Check size={10} strokeWidth={4} color="#ffffff" />
                    )}
                  </span>
                  <span className="truncate">{stat.task}</span>
                  <span className="shrink-0 font-mono text-xs text-gray-400">
                    {formatTimeToEnShort(stat.elapsedTime)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
