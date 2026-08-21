import { useTodoMutation } from "@/hooks/useTodoMutation";
import useTodoStore from "@/store/useTodoStore";
import useUserStore from "@/store/useUserStore";
import { Todo } from "@/types/todo";
import { toast } from "sonner";

type TodoItemProps = {
  todo: Todo;
};

export default function TodoItem({ todo }: TodoItemProps) {
  const { upsertTodo, updateTodos, archiveTodo, unarchiveTodo } =
    useTodoMutation();
  const user = useUserStore((state) => state.user);
  const editingTodo = useTodoStore((state) => state.editingTodo);
  const editingText = useTodoStore((state) => state.quickEditingText);
  const {
    setEditingTodo,
    removeTodo,
    toggleTodo,
    saveQuickEdit,
    setQuickEditingText,
  } = useTodoStore((state) => state.actions);
  const isEditing = editingTodo && editingTodo.id === todo.id;

  const handleSaveTodo = (text: string) => {
    saveQuickEdit(text);
    if (user) {
      if (editingTodo) {
        upsertTodo({
          id: editingTodo.id,
          data: {
            task: text,
            dailyGoalTime: editingTodo.dailyGoalTime,
            completed: editingTodo.completed,
          },
        });
      }
    } else {
      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
    }
  };

  const handleDeleteTodo = (id: string) => {
    removeTodo(id);
    const latestTodos = useTodoStore.getState().todos;
    updateTodos(latestTodos);

    if (user) {
      archiveTodo(id);
      toast("할 일을 보관했어요", {
        description: "기록은 통계에 남아 있어요.",
        action: {
          label: "실행취소",
          onClick: () => unarchiveTodo(id),
        },
      });
    }
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
