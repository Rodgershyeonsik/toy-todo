import { PlayerMode, PlayerStep } from "@/types/player";
import { Todo } from "@/types/todo";
import {
  ChevronDown,
  Hourglass,
  Pause,
  Play,
  Square,
  Timer,
  TimerReset,
} from "lucide-react";
import {
  cn,
  formatTime,
  formatTimeToEn,
  parseMinutes,
  playBeep,
} from "@/utils";
import { basicButtonCn, flexBetweenCn, flexCenterCn } from "@/constants/styles";
import { useEffect, useRef, useState } from "react";
import useTodoStore from "@/store/useTodoStore";
import { useTodoMutation } from "@/hooks/useTodoMutation";
import { useModalStore } from "@/store/useModalStore";

const playButtonStyle = `${flexCenterCn} w-12 h-12 border-2 border-white rounded-full hover:bg-white/10 transition-colors`;
const playerToggleStyle =
  "py-1.5 px-3 border-gray-600 border rounded-md bg-gray-800 hover:bg-white/10";

export default function TaskPlayer() {
  const { updateTodos } = useTodoMutation();
  const todos = useTodoStore((state) => state.todos);
  const { incrementTime, patchTodo: updateTodo } = useTodoStore();
  const [playerStatus, setPlayerStatus] = useState<PlayerStep>("IDLE");
  const [mode, setMode] = useState<PlayerMode>("STOPWATCH");
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const startStopwatch = (id?: string) => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerStatus("RUNNING");

    timerRef.current = setInterval(() => incrementTime(id), 1000);
  };

  const stopStopwatch = (id?: string) => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    updateTodo(id, { isRunning: false });
    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);
    setPlayerStatus("IDLE");
  };

  const pauseStopwatch = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
    }
    timerRef.current = null;
    setPlayerStatus("PAUSED");
  };

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerStatus("RUNNING");

    timerRef.current = setInterval(() => {
      setDuration((prev) => prev - 1);
      elapsedRef.current += 1;
    }, 1000);
  };

  const stopTimer = (id?: string) => {};

  const pauseTimer = () => {};

  const selectTodo = (id: string) => {
    updateTodo(id, { isRunning: true });
  };

  const resetElapsedTime = (id?: string) => {
    if (!id) return;
    updateTodo(id, { elapsedTime: 0 });
  };

  const handlePlayerMode = (mode: PlayerMode) => {
    if (runningTodo) {
      setPlayerStatus("READY");
      setMode(mode);
    } else {
      window.confirm("할 일을 선택해주세요!");
    }
  };

  useEffect(() => {
    if (duration === 0 && playerStatus === "RUNNING") {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      updateTodos(
        todos.map((t) =>
          t.id === runningTodo?.id
            ? { ...t, elapsedTime: t.elapsedTime + elapsedRef.current }
            : t
        )
      );
      setPlayerStatus("READY");
      playBeep();
    }
  }, [duration]);

  const runningTodo = todos.find((todo) => todo.isRunning);
  const isPlaying = playerStatus !== "IDLE";

  return (
    <div
      className={`${flexBetweenCn} my-2 bg-gray-700 text-white rounded-sm min-h-20 px-4 py-2`}
    >
      {playerStatus === "IDLE" && (
        <IdlePlayer
          todos={todos}
          onSelectTodo={selectTodo}
          onSelectMode={handlePlayerMode}
        />
      )}
      {isPlaying && mode === "TIMER" && (
        <TimerPlayer
          runningTodo={runningTodo}
          duration={duration}
          timerStatus={playerStatus}
          onStartCountdown={startCountdown}
          onStopTimer={stopStopwatch}
          onPauseTimer={pauseStopwatch}
          onSaveDuration={setDuration}
        />
      )}
      {isPlaying && mode === "STOPWATCH" && (
        <StopwatchPlayer
          runningTodo={runningTodo}
          timerStatus={playerStatus}
          onPlayTimer={startStopwatch}
          onStopTimer={stopStopwatch}
          onPauseTimer={pauseStopwatch}
          onResetElapsedTime={resetElapsedTime}
        />
      )}
    </div>
  );
}

const IdlePlayer = ({
  todos,
  onSelectTodo,
  onSelectMode,
}: {
  todos: Todo[];
  onSelectTodo: (value: string) => void;
  onSelectMode: (mode: PlayerMode) => void;
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
        className={cn(playerToggleStyle)}
        onClick={() => onSelectMode("TIMER")}
      >
        <Hourglass size={30} />
      </button>
      <button
        className={cn(playerToggleStyle)}
        onClick={() => onSelectMode("STOPWATCH")}
      >
        <Timer size={30} />
      </button>
    </div>
  );
};

const StopwatchPlayer = ({
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
  onPauseTimer: () => void;
  onResetElapsedTime: (id?: string) => void;
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
              : onPauseTimer
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
};

const TimerPlayer = ({
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
  onStartCountdown: (id?: string) => void;
  onStopTimer: (id?: string) => void;
  onPauseTimer: () => void;
  onSaveDuration: (seconds: number) => void;
}) => {
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
          onClick={() => onStopTimer(runningTodo?.id)}
        >
          <Square className="fill-white stroke-none" />
        </button>

        <button
          className={playButtonStyle}
          onClick={
            timerStatus === "PAUSED"
              ? () => onStartCountdown(runningTodo?.id)
              : onPauseTimer
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
};

const TimerSetModal = ({
  duration,
  onSaveDuration,
}: {
  duration: number;
  onSaveDuration: (minute: number) => void;
}) => {
  const { closeModal } = useModalStore();
  const [localDuration, setLocalDuration] = useState(duration);
  const [h, setH] = useState("0");
  const [m, setM] = useState("0");
  const [nowEdit, setNowEdit] = useState<null | "h" | "m">(null);

  const getHText = () => {
    const h = parseMinutes(localDuration).h;
    if (h === 0) return "00";

    if (h < 10) return "0" + h;
    return h + "";
  };

  const getMText = () => {
    const m = parseMinutes(localDuration).m;
    if (m === 0) return "00";

    if (m < 10) return "0" + m;
    return m + "";
  };

  const presetValue = [5, 10, 30];

  return (
    <form
      className={cn(flexCenterCn, "min-w-2", "flex-col", "px-3 py-2")}
      onSubmit={(e) => {
        e.preventDefault();
        onSaveDuration(localDuration * 60);
        closeModal();
      }}
    >
      {/* <div className="flex gap-1">
        {nowEdit === "h" ? (
          <input
            value={h}
            onChange={(e) => setH(e.target.value)}
            onBlur={() => onEnterTimeInput()}
            type="number"
          />
        ) : (
          <span onClick={() => setNowEdit("h")}>{getHText()}</span>
        )}
        <span>:</span>
        {nowEdit === "m" ? (
          <input value={m} onChange={(e) => setM(e.target.value)} />
        ) : (
          <span onClick={() => setNowEdit("m")}>{getMText()}</span>
        )}
      </div> */}
      <span className="m-5 text-4xl font-bold font-mono">
        {getHText()}:{getMText()}
      </span>
      <div className="flex justify-between w-full gap-1 py-3">
        <div
          className={cn(
            basicButtonCn,
            "w-15",
            "py-1",
            "bg-gray-700 border-gray-600",
            "text-white"
          )}
        >
          <TimerReset
            size={20}
            onClick={() => {
              setLocalDuration(0);
            }}
          />
        </div>
        {presetValue.map((item) => (
          <div
            key={item}
            className={cn(
              basicButtonCn,
              "p-0",
              "w-15",
              "bg-gray-700 border-gray-600",
              "text-white"
            )}
            onClick={() => setLocalDuration((prev) => prev + item)}
          >
            {`+${item}`}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className={cn(
          basicButtonCn,
          "w-full",
          " border-blue-400 bg-blue-500",
          "text-white font-mono"
        )}
      >
        OK
      </button>
    </form>
  );
};
