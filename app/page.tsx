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
import { Todo } from "./types/todo";
import TodoItem from "./TodoItem";
import { Pause, Play, Square } from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: "아침 먹기", completed: false },
    { id: 2, task: "점심 먹기", completed: false },
    { id: 3, task: "저녁 먹기", completed: false },
  ]);

  type TimerStep = "IDLE" | "RUNNING" | "PAUSED";

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [timerStatus, setTimerStatus] = useState<TimerStep>("IDLE");

  const idRef = useRef(3);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const taskPlayerButtonStyle =
    "flex items-center justify-center w-12 h-12 border-2 border-white rounded-full hover:bg-white/10 transition-colors";

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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${
      s < 10 ? `0${s}` : s
    }`;
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg px-6 py-10">
        <header>
          <h1 className="text-3xl font-bold">TODO LIST</h1>
          <span className="text-sm text-gray-500">
            할 일을 정리하고 완료해보십시다리^ㅡ^
          </span>
          <div className="flex justify-between items-center my-2 bg-gray-700 text-white rounded-sm min-h-20 px-5 py-2 gap-5">
            {timerStatus === "IDLE" ? (
              <div className="flex w-full justify-between items-center">
                <select
                  className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-600 outline-none cursor-pointer transition-all"
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setTodos((prev) =>
                      prev.map((t) => ({ ...t, isRunning: t.id === id }))
                    );
                  }}
                >
                  <option value="">할 일을 선택하여 시작해보세요</option>
                  {todos.map((todo) => (
                    <option key={todo.id} value={todo.id}>
                      {todo.task}
                    </option>
                  ))}
                </select>
                <button
                  className={taskPlayerButtonStyle}
                  onClick={() =>
                    runningTodo ? startTimer(runningTodo?.id) : {}
                  }
                >
                  <Play className="fill-white stroke-none" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{runningTodo?.task}</span>
                  <span className="text-2xl font-bold font-mono">
                    {formatTime(runningTodo?.elapsedTime ?? 0)}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    className={taskPlayerButtonStyle}
                    onClick={
                      runningTodo && timerStatus === "PAUSED"
                        ? () => startTimer(runningTodo.id)
                        : pauseTimer
                    }
                  >
                    {timerStatus === "PAUSED" ? (
                      <Play className="fill-white stroke-none" />
                    ) : (
                      <Pause className="fill-white stroke-none" />
                    )}
                  </button>

                  <button className={taskPlayerButtonStyle} onClick={stopTimer}>
                    <Square className="fill-white stroke-none" />
                  </button>
                </div>
              </>
            )}
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
                        onStartTimer={startTimer}
                        onStopTimer={stopTimer}
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
