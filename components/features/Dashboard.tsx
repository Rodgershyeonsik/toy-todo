import { flexBetweenCn, flexCenterCn } from "@/constants/styles";
import { Todo } from "@/types/todo";
import { cn, formatTime } from "@/utils";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import Modal from "../common/Modal";

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

const getCompletionRate = (elapsedTime: number, goalTime: number) => {
  return Math.floor((elapsedTime / (goalTime * 60)) * 100);
};

const getCompletionRateText = (todo: Todo) => {
  if (!todo.dailyGoalTime) return "N/A";

  return `${getCompletionRate(todo.elapsedTime, todo.dailyGoalTime)}%`;
};
const modalTextStyle = "text-xl font-mono font-bold";

export default function Dashbaord({ todos }: DashbaordProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const totalElapsed = todos.reduce(
    (acc, todo) => acc + (todo.elapsedTime ?? 0),
    0
  );

  const todosByTime = [...todos].sort(
    (a, b) => (b.elapsedTime ?? 0) - (a.elapsedTime ?? 0)
  );

  const handleOpenInfo = (id: string) => {
    setSelectedTodo(todos.find((t) => t.id === id) ?? null);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfo = () => {
    setSelectedTodo(null);
    setIsInfoModalOpen(false);
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
                <li key={todo.id} className={`${flexBetweenCn} px-1`}>
                  <div className={cn(flexBetweenCn, "w-full", "mr-3")}>
                    <span
                      className={`text-lg font-semibold ${
                        getRankColor(idx).text
                      }`}
                    >
                      {idx + 1}. {todo.task}
                    </span>
                    <button onClick={() => handleOpenInfo(todo.id)}>
                      <Info className="text-gray-600 font-bold" size={17} />
                    </button>
                  </div>

                  <span className="text-lg">
                    {formatTime(todo.elapsedTime ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Modal isOpen={isInfoModalOpen} onClose={handleCloseInfo}>
        <div className={`${cn(flexCenterCn)} flex-col px-5 py-3 gap-2`}>
          <span className="text-2xl font-mono font-bold">Todo Info</span>
          <div className="flex flex-col w-full">
            <span className={cn(modalTextStyle, "text-md font-semibold")}>
              Task
            </span>
            <span className={cn(modalTextStyle)}>
              {selectedTodo ? selectedTodo.task : "no data"}
            </span>
          </div>
          <div className="flex flex-col w-full">
            <span className={cn(modalTextStyle, "text-md font-semibold")}>
              Daily Goal Time
            </span>
            <span className={cn(modalTextStyle)}>
              {selectedTodo
                ? selectedTodo.dailyGoalTime ?? "Not Set"
                : "no data"}
            </span>
          </div>
          <div className="flex flex-col w-full">
            <span className={cn(modalTextStyle, "text-md font-semibold")}>
              Completion Rate
            </span>
            <span className={cn(modalTextStyle)}>
              {selectedTodo ? getCompletionRateText(selectedTodo) : "no data"}
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
