import { flexBetweenCn, flexCenterCn } from "@/constants/styles";
import { formatTime } from "@/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import TodoDetail from "./TodoDetail";
import { useModalStore } from "@/store/useModalStore";
import useTodoStore from "@/store/useTodoStore";

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

export default function Dashbaord() {
  const todos = useTodoStore((state) => state.todos);
  const { openModal } = useModalStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const totalElapsed = todos.reduce(
    (acc, todo) => acc + (todo.elapsedTime ?? 0),
    0
  );

  const todosByTime = [...todos].sort(
    (a, b) => (b.elapsedTime ?? 0) - (a.elapsedTime ?? 0)
  );

  const handleOpenDetail = (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (target) openModal(<TodoDetail todo={target} />);
  };

  const topThree = todosByTime.slice(0, 3);
  const others = todosByTime.slice(3);
  const othersTotal = others.reduce(
    (acc, cur) => acc + (cur.elapsedTime ?? 0),
    0
  );

  return (
    <div className="bg-gray-200 rounded-sm overflow-hidden transition-all duration-500 ease-in-out">
      <div className={`${flexBetweenCn} p-3`}>
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
          <div
            className={`${flexCenterCn} w-full h-8 bg-gray-500 overflow-hidden shadow-inner`}
          >
            {totalElapsed === 0 && (
              <span className="text-white text-lg font-semibold font-mono">
                no data
              </span>
            )}
            {totalElapsed > 0 && (
              <>
                {topThree.map((todo, idx) => (
                  <div
                    key={todo.id}
                    className={`${
                      getRankColor(idx).bg
                    } h-full transition-all duration-700 ease-out border-r border-white/20`}
                    style={{
                      width: `${(todo.elapsedTime / totalElapsed) * 100}%`,
                    }}
                  />
                ))}
                {todosByTime.length > 3 && (
                  <div
                    className={`${
                      getRankColor(3).bg
                    } h-full transition-all duration-700 ease-out`}
                    style={{
                      width: `${(othersTotal / totalElapsed) * 100}%`,
                    }}
                  />
                )}
              </>
            )}
          </div>
          <div className="space-y-2">
            <ul>
              {todosByTime.map((todo, idx) => (
                <li
                  key={todo.id}
                  onClick={() => handleOpenDetail(todo.id)}
                  className={`${flexBetweenCn} px-1`}
                >
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
