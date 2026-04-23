import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { Todo } from "@/types/todo";
import {
  cn,
  formatMinutesToEn,
  formatTimeToEn,
  getCompletionRate,
} from "@/utils";
import { useState } from "react";
import TodoEditor from "./TodoEditor";

type TodoDetailProps = {
  todo: Todo;
};

const getGoalTimeText = (goalTime?: number) => {
  if (!goalTime) return "Not Set";

  return formatMinutesToEn(goalTime);
};

const getCompletionRateText = (todo: Todo) => {
  if (!todo.dailyGoalTime) return "N/A";

  return `${getCompletionRate(todo.elapsedTime, todo.dailyGoalTime)}%`;
};

const DetailLi = ({
  id,
  label,
  content,
}: {
  id: string;
  label: string;
  content: React.ReactNode;
}) => {
  return (
    <li key={id} className="flex flex-col w-full">
      <span className="text-md font-mono font-semibold">{label}</span>
      <span className="text-xl font-mono font-bold">{content}</span>
    </li>
  );
};

export default function TodoDetail({ todo }: TodoDetailProps) {
  const [isOnEdit, setIsOnEdit] = useState(false);

  const details = [
    { label: "Task", content: todo.task },
    {
      label: "Elapsed Time",
      content: formatTimeToEn(todo.elapsedTime),
    },
    {
      label: "Daily Goal Time",
      content: getGoalTimeText(todo.dailyGoalTime),
    },
    {
      label: "Completion Rate",
      content: getCompletionRateText(todo),
    },
  ];

  return isOnEdit ? (
    <TodoEditor todo={todo} />
  ) : (
    <div className={`${cn(flexCenterCn)} flex-col px-5 py-3`}>
      <span className="text-2xl font-mono font-bold py-1.5">Todo Detail</span>
      <ul className="flex flex-col w-full p-2 gap-2">
        {details.map((item) => (
          <DetailLi id={item.label} label={item.label} content={item.content} />
        ))}
      </ul>
      <div className="flex w-full justify-end">
        <button
          onClick={() => setIsOnEdit(true)}
          className={cn(
            basicButtonCn,
            "mt-1",
            "text-white bg-gray-600 border-gray-800"
          )}
        >
          Go To Edit
        </button>
      </div>
    </div>
  );
}
