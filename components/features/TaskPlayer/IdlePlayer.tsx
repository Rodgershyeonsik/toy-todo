import { flexBetweenCn } from "@/constants/styles";
import { PlayerMode } from "@/types/player";
import { Todo } from "@/types/todo";
import { cn, formatTimeToEn } from "@/utils";
import { ChevronDown, Hourglass, Timer } from "lucide-react";
import { playerBasicStyle } from ".";

const playerToggleStyle =
  "py-1.5 px-3 border-gray-600 border rounded-md bg-gray-800 hover:bg-white/10";

export default function IdlePlayer({
  todos,
  onSelectTodo,
  onSelectMode,
}: {
  todos: Todo[];
  onSelectTodo: (value: string) => void;
  onSelectMode: (mode: PlayerMode) => void;
}) {
  return (
    <div className={cn(playerBasicStyle, "bg-gray-700")}>
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
}
