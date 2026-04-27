import useTodoStore from "@/store/useTodoStore";
import { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  editingText: string;
  onChangeEditingText: (editingText: string) => void;
};

export default function TodoItem({
  todo,
  editingText,
  onChangeEditingText,
}: TodoItemProps) {
  const editingTodo = useTodoStore((state) => state.editingTodo);
  const { setEditingTodo, deleteTodo, toggleTodo, saveQuickEdit } =
    useTodoStore();
  const isEditing = editingTodo && editingTodo.id === todo.id;
  return (
    <>
      <input
        type="checkbox"
        className="scale-125"
        checked={todo.completed}
        onChange={(e) => toggleTodo(todo.id, e.target.checked)}
      />
      {isEditing ? (
        <input
          value={editingText}
          onChange={(e) => onChangeEditingText(e.target.value)}
          onBlur={() => saveQuickEdit(editingText)}
          onKeyDown={(e) => e.key === "Enter" && saveQuickEdit(editingText)}
          autoFocus
          className="text-lg border px-1"
        />
      ) : (
        <div className="group flex justify-between w-full">
          <span
            className={`text-lg 
                      ${todo.completed ? "line-through text-gray-400" : ""}`}
            onClick={() => setEditingTodo(todo)}
          >
            {todo.task}
          </span>
          <button
            className="opacity-0 group-hover:opacity-80 hover:text-red-500 hover:font-bold transition"
            onClick={() => deleteTodo(todo.id)}
          >
            X
          </button>
        </div>
      )}
    </>
  );
}
