import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import useTodoStore from "@/store/useTodoStore";
import { createTodo, Todo, TodoFormData } from "@/types/todo";
import { cn } from "@/utils";
import { ChangeEvent, FormEvent, useState } from "react";

type TodoEditorProps = {
  todo?: Todo;
};

const labelCn = "text-lg font-mono font-bold";

export default function TodoEditor({ todo }: TodoEditorProps) {
  const { updateTodo, addTodo } = useTodoStore();
  const [formData, setFormData] = useState<TodoFormData>({
    task: todo ? todo.task : "",
    dailyGoalTime: todo ? todo.dailyGoalTime : 0,
  });

  const isEdit = !!todo;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEdit) {
      updateTodo(todo.id, formData);
      window.confirm("할 일 수정이 완료되었습니다!");
    } else {
      addTodo(createTodo(formData.task, formData.dailyGoalTime));
      window.confirm("할 일 추가가 완료되었습니다!");
    }
  };

  const title = !isEdit ? "Create Todo!" : "Edit Todo!";
  const submit = !isEdit ? "create" : "edit";

  return (
    <div className={`${flexCenterCn} flex-col min-w-sm px-5 py-3`}>
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
            value={formData.dailyGoalTime}
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
