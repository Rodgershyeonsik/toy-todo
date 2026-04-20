import { flexCenterCn } from "@/constants/styles";
import { Todo } from "@/types/todo";
import {
  cn,
  formatMinutesToEn,
  formatTimeToEn,
  getCompletionRate,
} from "@/utils";

type TodoDetailProps = {
  todo: Todo | null;
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
  const details = [
    { label: "Task", content: todo?.task ?? "no data" },
    {
      label: "Elapsed Time",
      content: todo ? formatTimeToEn(todo.elapsedTime) : "no data",
    },
    {
      label: "Daily Goal Time",
      content: todo ? getGoalTimeText(todo.dailyGoalTime) : "no data",
    },
    {
      label: "Completion Rate",
      content: todo ? getCompletionRateText(todo) : "no data",
    },
  ];

  return (
    <div className={`${cn(flexCenterCn)} flex-col px-5 py-3`}>
      <span className="text-2xl font-mono font-bold py-1.5">Todo Detail</span>
      <ul className="flex flex-col w-full p-2 gap-2">
        {details.map((item) => (
          <DetailLi id={item.label} label={item.label} content={item.content} />
        ))}
      </ul>
    </div>
  );
}
