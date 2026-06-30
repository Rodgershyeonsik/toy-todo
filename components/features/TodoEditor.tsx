import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { useModalStore } from "@/store/useModalStore";
import useTodoStore from "@/store/useTodoStore";
import { createTodo, Todo, TodoFormData } from "@/types/todo";
import { cn } from "@/utils";
import { ChangeEvent, FormEvent, useState } from "react";
import ModalConfirm from "../common/ModalConfirm";
import { CircleX } from "lucide-react";
import { useTodoMutation } from "@/hooks/useTodoMutation";
import useUserStore from "@/store/useUserStore";

type TodoEditorProps = {
  todo?: Todo;
};

const labelCn = "text-lg font-mono font-bold";

export default function TodoEditor({ todo }: TodoEditorProps) {
  const { updateTodos, addTodoAsync, updateTodoAsync } = useTodoMutation();
  const user = useUserStore((state) => state.user);
  const { patchTodo, addTodo, removeTodo } = useTodoStore();
  const { openModal, closeModal } = useModalStore();
  const [formData, setFormData] = useState<TodoFormData>({
    task: todo ? todo.task : "",
    dailyGoalTime: todo ? todo.dailyGoalTime ?? undefined : undefined,
  });

  const isEdit = !!todo;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      task: formData.task,
      dailyGoalTime: formData.dailyGoalTime ?? null,
    };

    if (isEdit) {
      const originTodo = { ...todo };
      patchTodo(todo.id, data);
      let msg = "할 일 수정 완료!";
      if (user) {
        try {
          await updateTodoAsync({ id: todo.id, data });
        } catch (error) {
          msg = "할 일 수정 실패.";
          patchTodo(todo.id, {
            task: originTodo.task,
            dailyGoalTime: originTodo.dailyGoalTime,
          });
        }
      }
      openModal(<ModalConfirm text={msg} />);
    } else {
      const newTodo = createTodo(data.task, data.dailyGoalTime);
      addTodo(newTodo);
      let msg = "할 일 추가 완료!";
      if (user) {
        try {
          await addTodoAsync(newTodo);
        } catch (error) {
          msg = "할 일 추가 실패.";
          removeTodo(newTodo.id);
        }
      }
      openModal(<ModalConfirm text={msg} />);
    }

    if (!user) {
      const latestTodos = useTodoStore.getState().todos;
      updateTodos(latestTodos);
    }
  };

  const title = !isEdit ? "Create Todo!" : "Edit Todo!";
  const submit = !isEdit ? "create" : "edit";

  return (
    <div className={`${flexCenterCn} flex-col min-w-sm px-5 py-3`}>
      <div className="flex w-full justify-end">
        <button onClick={closeModal}>
          <CircleX color="#c8c1c1" />
        </button>
      </div>
      <h1 className="text-2xl font-bold font-mono">{title}</h1>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="my-5">
          <label className={labelCn}>Task</label>
          <input
            type="text"
            name="task"
            value={formData.task}
            onChange={handleChange}
            placeholder="plz enter task..."
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="my-5">
          <label className={labelCn}>Daily Goal Time(min)</label>
          <input
            type="number"
            name="dailyGoalTime"
            value={formData.dailyGoalTime ?? ""}
            onChange={handleChange}
            placeholder="plz enter daily goal time..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <div className="flex w-full justify-end">
          <button
            type="submit"
            className={`${cn(
              basicButtonCn,
              "border-blue-500 bg-blue-400 text-white",
              "w-[35%]"
            )}`}
          >
            {submit}
          </button>
        </div>
      </form>
    </div>
  );
}
