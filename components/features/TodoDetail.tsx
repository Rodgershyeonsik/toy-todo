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
import { CircleX } from "lucide-react";
import { useModalStore } from "@/store/useModalStore";

type TodoDetailProps = {
  todo: Todo;
};

const getGoalTimeText = (goalTime: number | null) => {
  if (!goalTime) return "Not Set";

  return formatMinutesToEn(goalTime);
};

const getCompletionRateText = (todo: Todo) => {
  if (!todo.dailyGoalTime) return "N/A";

  return `${getCompletionRate(todo.elapsedTime, todo.dailyGoalTime)}%`;
};

const DetailLi = ({
  label,
  content,
}: {
  label: string;
  content: React.ReactNode;
}) => {
  return (
    <li className="flex flex-col w-full">
      <span className="text-md text-gray-600 font-mono font-semibold">
        {label}
      </span>
      <span className="text-xl font-mono font-bold">{content}</span>
    </li>
  );
};

export default function TodoDetail({ todo }: TodoDetailProps) {
  const { closeModal } = useModalStore();
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
    <div className={`${cn(flexCenterCn)} flex-col px-2 py-2`}>
      <div className="flex w-full justify-end">
        <button onClick={closeModal}>
          <CircleX color="#c8c1c1" />
        </button>
      </div>
      <span className="text-2xl font-mono font-bold py-1.5">Todo Detail</span>
      <ul className="flex flex-col w-full p-2 gap-3">
        {details.map((item) => (
          <DetailLi
            key={item.label}
            label={item.label}
            content={item.content}
          />
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
