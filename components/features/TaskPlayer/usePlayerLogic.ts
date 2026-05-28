import { useTodoMutation } from "@/hooks/useTodoMutation";
import useTodoStore from "@/store/useTodoStore";
import { PlayerMode, PlayerStep } from "@/types/player";
import { Todo } from "@/types/todo";
import { playBeep } from "@/utils";
import { useEffect, useRef, useState } from "react";

export function usePlayerLogic() {
  const { updateTodos } = useTodoMutation();
  const todos = useTodoStore((state) => state.todos);
  const { patchTodo } = useTodoStore();
  const [playerStatus, setPlayerStatus] = useState<PlayerStep>("IDLE");
  const [mode, setMode] = useState<PlayerMode>("STOPWATCH");
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);
  const initialDurationRef = useRef(0);
  const notifTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAlarm = (remainingSeconds: number) => {
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    notifTimeoutRef.current = setTimeout(() => {
      if (document.visibilityState === "visible") return;
      playBeep();
      if (Notification.permission === "granted") {
        new Notification("타이머 종료!", {
          body: "설정 시간이 종료되었습니다.",
        });
      }
    }, remainingSeconds * 1000);
  };

  const startStopwatch = (id?: string) => {
    if (!id) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerStatus("RUNNING");

    const baseElapsed =
      useTodoStore.getState().todos.find((t) => t.id === id)?.elapsedTime ?? 0;
    baseElapsedRef.current = baseElapsed;
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      patchTodo(id, { elapsedTime: baseElapsed + elapsed });
    }, 1000);
  };

  const stopStopwatch = (id?: string) => {
    if (!id) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      patchTodo(id, {
        isRunning: false,
        elapsedTime: baseElapsedRef.current + elapsed,
      });
    } else {
      patchTodo(id, { isRunning: false });
    }

    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);
    setPlayerStatus("IDLE");
  };

  const pauseStopwatch = (id?: string) => {
    if (!id) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      patchTodo(id, { elapsedTime: baseElapsedRef.current + elapsed });
      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
    }
    timerRef.current = null;
    setPlayerStatus("PAUSED");
  };

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayerStatus("RUNNING");
    initialDurationRef.current = duration;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      const diff = initialDurationRef.current - elapsed;
      setDuration(diff > 0 ? diff : 0);
      elapsedRef.current = elapsed;
    }, 1000);
    scheduleAlarm(duration);
  };

  const stopTimer = (runningTodo?: Todo) => {
    if (!runningTodo) return;
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      patchTodo(runningTodo.id, {
        isRunning: false,
        elapsedTime: runningTodo.elapsedTime + elapsed,
      });
      elapsedRef.current = 0;
    } else {
      patchTodo(runningTodo.id, {
        isRunning: false,
      });
    }
    setDuration(0);
    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);
    setPlayerStatus("IDLE");
  };

  const pauseTimer = (runningTodo?: Todo) => {
    if (!runningTodo) return;
    if (notifTimeoutRef.current) clearTimeout(notifTimeoutRef.current);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
      patchTodo(runningTodo.id, {
        elapsedTime: runningTodo.elapsedTime + elapsed,
      });
      setDuration(Math.max(0, initialDurationRef.current - elapsed));
      elapsedRef.current = 0;
      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
    }
    timerRef.current = null;
    setPlayerStatus("PAUSED");
  };

  const selectTodo = (id: string) => {
    patchTodo(id, { isRunning: true });
  };

  const resetElapsedTime = (id?: string) => {
    if (!id) return;
    patchTodo(id, { elapsedTime: 0 });
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
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (duration === 0 && playerStatus === "RUNNING") {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      if (runningTodo) {
        patchTodo(runningTodo.id, {
          elapsedTime: runningTodo.elapsedTime + elapsedRef.current,
        });
      }

      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
      setPlayerStatus("READY");
      playBeep();
    }
  }, [duration]);

  const runningTodo = todos.find((todo) => todo.isRunning);
  const isPlaying = playerStatus !== "IDLE";

  return {
    todos,
    mode,
    isPlaying,
    selectTodo,
    handlePlayerMode,
    runningTodo,
    duration,
    playerStatus,
    startCountdown,
    stopTimer,
    pauseTimer,
    setDuration,
    startStopwatch,
    stopStopwatch,
    pauseStopwatch,
    resetElapsedTime,
  };
}
