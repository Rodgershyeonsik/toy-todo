import { Todo } from "@/types/todo";
import { formatTime } from "@/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type DashbaordProps = {
  todos: Todo[];
};

const getRankColor = (idx: number) => {
  switch (idx) {
    case 0:
      return { bg: "bg-cyan-500", text: "text-cyan-500" };
    case 1:
      return { bg: "bg-sky-600", text: "text-sky-600" };
    case 2:
      return { bg: "bg-teal-400", text: "text-teal-400" };
    default:
      return { bg: "bg-slate-400", text: "text-slate-400" };
  }
};

export default function Dashbaord({ todos }: DashbaordProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const totalElapsed = todos.reduce(
    (acc, todo) => acc + (todo.elapsedTime ?? 0),
    0
  );

  const todosByTime = [...todos].sort(
    (a, b) => (b.elapsedTime ?? 0) - (a.elapsedTime ?? 0)
  );

  return (
    <div className="bg-gray-200 rounded-sm overflow-hidden transition-all duration-500 ease-in-out">
      <div className="flex justify-between items-center p-3">
        <span className="text-lg font-bold font-mono">
          {`Total Elapsed Time | ${formatTime(totalElapsed)}`}
        </span>
        <button
          className="p-1 hover:bg-gray-300 rounded-full transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="w-full h-4 bg-gray-300 rounded-full flex overflow-hidden">
            {/* 가로비중차트 */}
          </div>
          <div className="space-y-2">
            <ul>
              {todosByTime.map((todo, idx) => (
                <li key={todo.id} className="flex justify-between px-1">
                  <span
                    className={`text-lg font-semibold ${
                      getRankColor(idx).text
                    }`}
                  >
                    {idx + 1}. {todo.task}
                  </span>
                  <span className="text-lg">
                    {formatTime(todo.elapsedTime ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
