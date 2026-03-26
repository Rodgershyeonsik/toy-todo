import { TimerStep } from "@/types/timer";
import { Todo } from "@/types/todo";
import { Pause, Play, Square } from "lucide-react";
import { formatTime } from "@/utils";

type TaskPlayerProps = {
  timerStatus: TimerStep;
  todos: Todo[];
  onSelectTodo: (value: string) => void;
  onPlayTimer: () => void;
  onStopTimer: () => void;
  onPauseTimer: () => void;
  onResetElapsedTime: (id: number) => void;
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
  onResetElapsedTime,
}: TaskPlayerProps) {
  const runningTodo = todos.find((todo) => todo.isRunning);

  return (
    <div className="flex justify-between items-center my-2 bg-gray-700 text-white rounded-sm min-h-20 px-5 py-2 gap-5">
      {timerStatus === "IDLE" ? (
        <div className="flex w-full justify-between items-center">
          <select
            className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-600 outline-none cursor-pointer transition-all"
            onChange={(e) => onSelectTodo(e.target.value)}
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
            <div className="flex gap-3 items-center">
              <span className="text-2xl font-bold font-mono">
                {formatTime(runningTodo?.elapsedTime ?? 0)}
              </span>
              <button
                className="bg-white/10 hover:bg-white/20 rounded-sm border border-gray-500 text-gray-50 text-sm font-semibold font-mono h-6 w-14"
                onClick={() => {
                  if (runningTodo) onResetElapsedTime(runningTodo.id);
                }}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              className={taskPlayerButtonStyle}
              onClick={timerStatus === "PAUSED" ? onPlayTimer : onPauseTimer}
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
