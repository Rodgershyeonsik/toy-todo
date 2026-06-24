import { useTodoMutation } from "@/hooks/useTodoMutation";
import useTodoStore from "@/store/useTodoStore";
import useUserStore from "@/store/useUserStore";
import { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { addTodo, updateTodos, deleteTodo } = useTodoMutation();
  const user = useUserStore((state) => state.user);
  const editingTodo = useTodoStore((state) => state.editingTodo);
  const editingText = useTodoStore((state) => state.quickEditingText);
  const {
    setEditingTodo,
    removeTodo,
    toggleTodo,
    saveQuickEdit,
    setQuickEditingText,
  } = useTodoStore();
  const isEditing = editingTodo && editingTodo.id === todo.id;

  const handleSaveTodo = (text: string) => {
    saveQuickEdit(text);
    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);
    if (user && editingTodo) addTodo({ id: editingTodo.id, task: text });
  };

  const handleDeleteTodo = (id: string) => {
    removeTodo(id);
    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);
    if (user) deleteTodo(id);
  };

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
          onChange={(e) => setQuickEditingText(e.target.value)}
          onBlur={() => handleSaveTodo(editingText)}
          onKeyDown={(e) => e.key === "Enter" && handleSaveTodo(editingText)}
          autoFocus
          className="w-full text-lg border px-1"
        />
      ) : (
        <div className="group flex justify-between w-full">
          <span
            className={`text-lg 
                      ${todo.completed ? "line-through text-gray-400" : ""}`}
            onClick={() => {
              setQuickEditingText(todo.task);
              setEditingTodo(todo);
            }}
          >
            {todo.task}
          </span>
          <button
            className="opacity-0 group-hover:opacity-80 hover:text-red-500 hover:font-bold transition"
            onClick={() => handleDeleteTodo(todo.id)}
          >
            X
          </button>
        </div>
      )}
    </>
  );
}
