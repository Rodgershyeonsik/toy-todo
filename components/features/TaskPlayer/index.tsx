import { flexBetweenCn, flexCenterCn } from "@/constants/styles";
import IdlePlayer from "./IdlePlayer";
import StopwatchPlayer from "./StopwatchPlayer";
import TimerPlayer from "./TimerPlayer";
import { usePlayerLogic } from "./usePlayerLogic";

export const playButtonStyle = `${flexCenterCn} w-12 h-12 border-2 border-white rounded-full hover:bg-white/10 transition-colors`;

export default function TaskPlayer() {
  const {
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
  } = usePlayerLogic();

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
          onStopTimer={stopTimer}
          onPauseTimer={pauseTimer}
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
