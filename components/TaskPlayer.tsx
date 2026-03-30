import { TimerStep } from "@/types/timer";
import { Todo } from "@/types/todo";
import { ChevronDown, Pause, Play, Square } from "lucide-react";
import { formatTime, formatTimeToEn } from "@/utils";

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
    <div className="flex justify-between items-center my-2 bg-gray-700 text-white rounded-sm min-h-20 px-4 py-2">
      {timerStatus === "IDLE" ? (
        <div className="flex w-full justify-between items-center">
          <div className="flex w-full relative max-w-[70%] items-center bg-gray-800 border border-gray-600 outline-none text-sm rounded-md cursor-pointer">
            <select
              className="w-full appearance-none px-2 py-2.5"
              onChange={(e) => onSelectTodo(e.target.value)}
            >
              <option value="">할 일을 선택하여 시작해보세요</option>
              {todos.map((todo) => (
                <option key={todo.id} value={todo.id}>
                  {todo.task}
                  {`(${formatTimeToEn(todo.elapsedTime ?? 0)})`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 ml-1.5 pointer-events-none"
            />
          </div>
          <button
            className={`${taskPlayerButtonStyle} shrink-0 ml-1.5`}
            onClick={onPlayTimer}
          >
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
