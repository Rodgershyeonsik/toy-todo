import { ChangeEvent } from "react";
import { TimerStep } from "./types/timer";
import { Todo } from "./types/todo";
import { Pause, Play, Square } from "lucide-react";

type TaskPlayerProps = {
  timerStatus: TimerStep;
  todos: Todo[];
  onSelectTodo: (e: ChangeEvent<HTMLSelectElement>) => void;
  onPlayTimer: () => void;
  onStopTimer: () => void;
  onPauseTimer: () => void;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${
    s < 10 ? `0${s}` : s
  }`;
};

const taskPlayerButtonStyle =
  "flex items-center justify-center w-12 h-12 border-2 border-white rounded-full hover:bg-white/10 transition-colors";

export default function TaskPlayer({
  timerStatus,
  todos,
  onSelectTodo,
  onPlayTimer,
  onStopTimer,
  onPauseTimer,
}: TaskPlayerProps) {
  const runningTodo = todos.find((todo) => todo.isRunning);

  return (
    <div className="flex justify-between items-center my-2 bg-gray-700 text-white rounded-sm min-h-20 px-5 py-2 gap-5">
      {timerStatus === "IDLE" ? (
        <div className="flex w-full justify-between items-center">
          <select
            className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-600 outline-none cursor-pointer transition-all"
            onChange={onSelectTodo}
          >
            <option value="">할 일을 선택하여 시작해보세요</option>
            {todos.map((todo) => (
              <option key={todo.id} value={todo.id}>
                {todo.task}
              </option>
            ))}
          </select>
          <button className={taskPlayerButtonStyle} onClick={onPlayTimer}>
            <Play className="fill-white stroke-none" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <span className="text-lg font-bold">{runningTodo?.task}</span>
            <span className="text-2xl font-bold font-mono">
              {formatTime(runningTodo?.elapsedTime ?? 0)}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              className={taskPlayerButtonStyle}
              onClick={
                timerStatus === "PAUSED" ? () => onPlayTimer : onPauseTimer
              }
            >
              {timerStatus === "PAUSED" ? (
                <Play className="fill-white stroke-none" />
              ) : (
                <Pause className="fill-white stroke-none" />
              )}
            </button>

            <button className={taskPlayerButtonStyle} onClick={onStopTimer}>
              <Square className="fill-white stroke-none" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
