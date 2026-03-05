import { Todo } from "./types/todo";
import { Play, Pause } from "lucide-react";

type TodoItemProps = {
  todo: Todo;
  isEditing: boolean;
  editingText: string;
  onToggle: (checked: boolean, todo: Todo) => void;
  onStartEdit: (todo: Todo) => void;
  onChangeEditingText: (editingText: string) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onStartTimer: (id: number) => void;
  onStopTimer: () => void;
};

export default function TodoItem({
  todo,
  isEditing,
  editingText,
  onToggle: onCheck,
  onStartEdit,
  onChangeEditingText,
  onSave,
  onDelete,
  onStartTimer,
  onStopTimer,
}: TodoItemProps) {
  return (
    <>
      <input
        type="checkbox"
        className="scale-125"
        checked={todo.completed}
        onChange={(e) => onCheck(e.target.checked, todo)}
      />
      {isEditing ? (
        <input
          value={editingText}
          onChange={(e) => onChangeEditingText(e.target.value)}
          onBlur={() => onSave(todo.id)}
          onKeyDown={(e) => e.key === "Enter" && onSave(todo.id)}
          autoFocus
          className="text-lg border px-1"
        />
      ) : (
        <div className="group flex justify-between w-full">
          <span
            className={`text-lg 
                      ${todo.completed ? "line-through text-gray-400" : ""}`}
            onClick={() => onStartEdit(todo)}
          >
            {todo.task}
          </span>
          <button
            className="opacity-0 group-hover:opacity-100 transition"
            onClick={() =>
              todo.isRunning ? onStopTimer() : onStartTimer(todo.id)
            }
          >
            {todo.isRunning ? (
              <Pause className="w-5 h-5 fill-gray-400 hover:fill-green-500 stroke-none" />
            ) : (
              <Play className="w-5 h-5 fill-gray-400 hover:fill-green-500 stroke-none" />
            )}
          </button>
          <button
            className="opacity-0 group-hover:opacity-80 hover:text-red-500 hover:font-bold transition"
            onClick={() => onDelete(todo.id)}
          >
            X
          </button>
        </div>
      )}
    </>
  );
}
