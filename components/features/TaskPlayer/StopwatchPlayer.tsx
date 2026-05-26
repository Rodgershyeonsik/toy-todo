import { PlayerStep } from "@/types/player";
import { Todo } from "@/types/todo";
import { cn, formatTime } from "@/utils";
import { Pause, Play, Square } from "lucide-react";
import { playButtonStyle, playerBasicStyle } from ".";

export default function StopwatchPlayer({
  runningTodo,
  timerStatus,
  onPlayTimer,
  onStopTimer,
  onPauseTimer,
  onResetElapsedTime,
}: {
  runningTodo?: Todo;
  timerStatus: PlayerStep;
  onPlayTimer: (id?: string) => void;
  onStopTimer: (id?: string) => void;
  onPauseTimer: (id?: string) => void;
  onResetElapsedTime: (id?: string) => void;
}) {
  return (
    <div className={cn(playerBasicStyle, "bg-blue-400")}>
      <div className="flex flex-col">
        <span className="text-lg font-bold">{runningTodo?.task}</span>
        <div className="flex gap-3 items-center">
          <span className="text-2xl font-bold font-mono">
            {formatTime(runningTodo?.elapsedTime ?? 0)}
          </span>
          <button
            className="bg-white/10 hover:bg-white/20 rounded-sm border border-blue-200 text-white text-sm font-semibold font-mono h-6 w-14"
            onClick={() => onResetElapsedTime(runningTodo?.id)}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          className={playButtonStyle}
          onClick={() => onStopTimer(runningTodo?.id)}
        >
          <Square className="fill-white stroke-none" />
        </button>

        <button
          className={playButtonStyle}
          onClick={
            timerStatus === "PAUSED"
              ? () => onPlayTimer(runningTodo?.id)
              : () => onPauseTimer(runningTodo?.id)
          }
        >
          {timerStatus === "PAUSED" || timerStatus === "READY" ? (
            <Play className="fill-white stroke-none" />
          ) : (
            <Pause className="fill-white stroke-none" />
          )}
        </button>
      </div>
    </div>
  );
}
