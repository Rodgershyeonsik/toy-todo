import { TimerStep } from "@/types/timer";
import { Todo } from "@/types/todo";
import { ChevronDown, Pause, Play, Square } from "lucide-react";
import { formatTime, formatTimeToEn } from "@/utils";
import { flexBetweenCn, flexCenterCn } from "@/constants/styles";
import { useRef, useState } from "react";
import useTodoStore from "@/store/useTodoStore";

const taskPlayerButtonStyle = `${flexCenterCn} w-12 h-12 border-2 border-white rounded-full hover:bg-white/10 transition-colors`;

export default function TaskPlayer() {
  const todos = useTodoStore((state) => state.todos);
  const { incrementTime, updateTodo } = useTodoStore();
  const [timerStatus, setTimerStatus] = useState<TimerStep>("IDLE");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (id?: string) => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerStatus("RUNNING");

    timerRef.current = setInterval(() => incrementTime(id), 1000);
  };

  const stopTimer = (id?: string) => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    updateTodo(id, { isRunning: false });
    setTimerStatus("IDLE");
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerStatus("PAUSED");
  };

  const selectTodo = (id?: string) => {
    if (!id) return;
    updateTodo(id, { isRunning: true });
  };

  const resetElapsedTime = (id?: string) => {
    if (!id) return;
    updateTodo(id, { elapsedTime: 0 });
  };

  const runningTodo = todos.find((todo) => todo.isRunning);

  return (
    <div
      className={`${flexBetweenCn} my-2 bg-gray-700 text-white rounded-sm min-h-20 px-4 py-2`}
    >
      {timerStatus === "IDLE" ? (
        <IdlePlayer
          todos={todos}
          onSelectTodo={() => selectTodo(runningTodo?.id)}
          onPlayTimer={() => startTimer(runningTodo?.id)}
        />
      ) : (
        <ActivePlayer
          runningTodo={runningTodo}
          timerStatus={timerStatus}
          onPlayTimer={() => startTimer(runningTodo?.id)}
          onStopTimer={() => stopTimer(runningTodo?.id)}
          onPauseTimer={pauseTimer}
          onResetElapsedTime={() => resetElapsedTime(runningTodo?.id)}
        />
      )}
    </div>
  );
}

const IdlePlayer = ({
  todos,
  onSelectTodo,
  onPlayTimer,
}: {
  todos: Todo[];
  onSelectTodo: (value: string) => void;
  onPlayTimer: () => void;
}) => {
  return (
    <div className={`${flexBetweenCn} w-full`}>
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
  );
};

const ActivePlayer = ({
  runningTodo,
  timerStatus,
  onPlayTimer,
  onStopTimer,
  onPauseTimer,
  onResetElapsedTime,
}: {
  runningTodo: Todo | undefined;
  timerStatus: TimerStep;
  onPlayTimer: () => void;
  onStopTimer: () => void;
  onPauseTimer: () => void;
  onResetElapsedTime: (id: string) => void;
}) => {
  return (
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
        <button className={taskPlayerButtonStyle} onClick={onStopTimer}>
          <Square className="fill-white stroke-none" />
        </button>

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
      </div>
    </>
  );
};
