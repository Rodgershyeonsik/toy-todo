"use client";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import SortableItem from "./SortableItem";
import { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";
import { TimerStep } from "@/types/timer";
import TaskPlayer from "./TaskPlayer";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatTime } from "@/utils";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: "아침 먹기", completed: false },
    { id: 2, task: "점심 먹기", completed: false },
    { id: 3, task: "저녁 먹기", completed: false },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [timerStatus, setTimerStatus] = useState<TimerStep>("IDLE");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const idRef = useRef(3);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (id: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerStatus("RUNNING");

    timerRef.current = setInterval(
      () =>
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, elapsedTime: (t.elapsedTime ?? 0) + 1 } : t
          )
        ),
      1000
    );
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTodos((prev) => prev.map((t) => ({ ...t, isRunning: false })));
    setTimerStatus("IDLE");
  };

  const pauseTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerStatus("PAUSED");
  };

  const handleAddTodo = () => {
    idRef.current += 1;
    const newTodo = { id: idRef.current, task: "", completed: false };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setEditingId(newTodo.id);
    setEditingText("");
  };

  const handleCheckTodo = (checked: boolean, todo: Todo) => {
    setTodos((prevTodos) => {
      const newTodo = prevTodos.map((t) =>
        t.id === todo.id ? { ...t, completed: checked } : t
      );

      const ing = newTodo.filter((t) => !t.completed);
      const completed = newTodo.filter((t) => t.completed);

      return [...ing, ...completed];
    });
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.task);
  };

  const saveEdit = (id: number) => {
    setTodos((prev) => {
      if (!editingText.trim()) {
        return prev.filter((t) => t.id !== id);
      }

      return prev.map((t) => (t.id === id ? { ...t, task: editingText } : t));
    });
    setEditingId(null);
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id != over.id) {
      setTodos((prev) => {
        const oldIdx = prev.findIndex((todo) => todo.id === Number(active.id));
        const newIdx = prev.findIndex((todo) => todo.id === Number(over.id));

        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const runningTodo = todos.find((todo) => todo.isRunning);
  const totalElapsed = todos.reduce(
    (acc, todo) => acc + (todo.elapsedTime ?? 0),
    0
  );

  const todosByTime = [...todos].sort(
    (a, b) => (b.elapsedTime ?? 0) - (a.elapsedTime ?? 0)
  );

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

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg px-6 py-10">
        <header>
          <h1 className="text-3xl font-bold">TODO LIST</h1>
          <span className="text-sm text-gray-500">
            할 일을 정리하고 완료해보십시다리^ㅡ^
          </span>
          <TaskPlayer
            timerStatus={timerStatus}
            todos={todos}
            onSelectTodo={(e) => {
              const id = Number(e.target.value);
              setTodos((prev) =>
                prev.map((t) => ({ ...t, isRunning: t.id === id }))
              );
            }}
            onPlayTimer={() => {
              if (!runningTodo) return;
              startTimer(runningTodo.id);
            }}
            onStopTimer={stopTimer}
            onPauseTimer={pauseTimer}
          />
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
        </header>

        <main>
          <div className="py-2">
            <button className="text-lg text-gray-400" onClick={handleAddTodo}>
              {" "}
              + 할 일 추가...
            </button>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="list-none space-y-2">
                  {todos.map((todo) => (
                    <SortableItem
                      key={todo.id}
                      id={todo.id}
                      className="flex items-center gap-2 group"
                    >
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        isEditing={editingId === todo.id}
                        editingText={editingText}
                        onToggle={handleCheckTodo}
                        onStartEdit={startEdit}
                        onChangeEditingText={setEditingText}
                        onSave={saveEdit}
                        onDelete={deleteTodo}
                      />
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </main>
      </div>
    </div>
  );
}
