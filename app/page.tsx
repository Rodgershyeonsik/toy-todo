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
import { useEffect, useRef, useState } from "react";
import SortableItem from "@/components/features/SortableItem";
import { createTodo, Todo, TodoFormData } from "@/types/todo";
import TodoItem from "@/components/features/TodoItem";
import { TimerStep } from "@/types/timer";
import TaskPlayer from "@/components/features/TaskPlayer";
import Dashbaord from "@/components/features/Dashboard";
import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { SquarePlus } from "lucide-react";
import Modal from "@/components/common/Modal";
import TodoEditor from "@/components/features/TodoEditor";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [timerStatus, setTimerStatus] = useState<TimerStep>("IDLE");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (id: string) => {
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
    const newTodo = createTodo();
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

  const saveEdit = (id: string) => {
    setTodos((prev) => {
      if (!editingText.trim()) {
        return prev.filter((t) => t.id !== id);
      }

      return prev.map((t) => (t.id === id ? { ...t, task: editingText } : t));
    });
    setEditingId(null);
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => ({ ...t, isRunning: t.id === id })));
  };

  const resetElapsedTime = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, elapsedTime: 0 } : t))
    );
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
        const oldIdx = prev.findIndex((todo) => todo.id === active.id);
        const newIdx = prev.findIndex((todo) => todo.id === over.id);

        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const handleResetAllTimes = () => {
    const isConfirmed = window.confirm(
      "모든 투두의 소요 시간을 초기화하시겠습니까?"
    );

    if (isConfirmed) {
      setTodos((prev) => prev.map((t) => ({ ...t, elapsedTime: 0 })));
    }
  };

  const handleDeleteAllTodos = () => {
    const isConfirmed = window.confirm("모든 투두를 삭제하시겠습니까?");

    if (isConfirmed) {
      setTodos((prev) => []);
    }
  };

  const handleCreateTodo = (data: TodoFormData) => {
    let newTodo = createTodo(data.task, data.dailyGoalTime);
    setTodos((prev) => [newTodo, ...prev]);
  };

  const handleEditTodo = (data: TodoFormData, id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, task: data.task, dailyGoalTime: data.dailyGoalTime }
          : t
      )
    );
  };

  const runningTodo = todos.find((todo) => todo.isRunning);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const savedTodos = localStorage.getItem("my-todos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("데이터 불러오기 실패", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("my-todos", JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg px-6 py-10">
        <header>
          <div className="flex justify-between">
            <div>
              <h1 className="text-3xl font-bold">TODO LIST</h1>
              <span className="text-sm text-gray-500">
                할 일을 정리하고 완료해보십시다리^ㅡ^
              </span>
            </div>
            <button onClick={() => setIsOpen(true)}>
              <SquarePlus
                className="text-gray-400 hover:text-blue-400"
                size={40}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              className={`${flexCenterCn} ${basicButtonCn} flex-1 border-gray-200 bg-gray-100 hover:bg-black/20`}
              onClick={handleResetAllTimes}
            >
              Reset All Times
            </button>
            <button
              className={`${flexCenterCn} ${basicButtonCn} flex-1 text-white border-gray-700 bg-gray-800 hover:bg-black/60`}
              onClick={handleDeleteAllTodos}
            >
              Delete All Todos
            </button>
          </div>
          <TaskPlayer
            timerStatus={timerStatus}
            todos={todos}
            onSelectTodo={handleSelectTodo}
            onPlayTimer={() => {
              if (!runningTodo) return;
              startTimer(runningTodo.id);
            }}
            onStopTimer={stopTimer}
            onPauseTimer={pauseTimer}
            onResetElapsedTime={resetElapsedTime}
          />
          <Dashbaord todos={todos} />
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

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <TodoEditor onCreate={handleCreateTodo} onEdit={handleEditTodo} />
        </Modal>
      </div>
    </div>
  );
}
