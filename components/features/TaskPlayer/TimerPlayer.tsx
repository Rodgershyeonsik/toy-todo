import { Pause, Play, Square } from "lucide-react";
import { playButtonStyle } from ".";
import { formatTime } from "@/utils";
import { Todo } from "@/types/todo";
import { PlayerStep } from "@/types/player";
import { useModalStore } from "@/store/useModalStore";
import TimerSetModal from "./TimerSetModal";

export default function TimerPlayer({
  runningTodo,
  duration,
  timerStatus,
  onStartCountdown,
  onStopTimer,
  onPauseTimer,
  onSaveDuration,
}: {
  runningTodo?: Todo;
  duration: number;
  timerStatus: PlayerStep;
  onStartCountdown: () => void;
  onStopTimer: (runningTodo?: Todo) => void;
  onPauseTimer: (runningTodo?: Todo) => void;
  onSaveDuration: (seconds: number) => void;
}) {
  const { openModal } = useModalStore();

  return (
    <>
      <div className="flex flex-col">
        <span className="text-lg font-bold">{runningTodo?.task}</span>
        <div className="flex gap-3 items-center">
          <span
            className="text-2xl font-bold font-mono"
            onClick={() =>
              openModal(
                <TimerSetModal
                  duration={duration}
                  onSaveDuration={onSaveDuration}
                />
              )
            }
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button
          className={playButtonStyle}
          onClick={() => onStopTimer(runningTodo)}
        >
          <Square className="fill-white stroke-none" />
        </button>

        <button
          className={playButtonStyle}
          onClick={
            timerStatus === "PAUSED"
              ? onStartCountdown
              : () => onPauseTimer(runningTodo)
          }
        >
          {timerStatus === "PAUSED" || timerStatus === "READY" ? (
            <Play className="fill-white stroke-none" />
          ) : (
            <Pause className="fill-white stroke-none" />
          )}
        </button>
      </div>
    </>
  );
}
