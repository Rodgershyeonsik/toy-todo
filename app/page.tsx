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
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import SortableItem from "@/components/features/SortableItem";
import { createTodo } from "@/types/todo";
import TodoItem from "@/components/features/TodoItem";
import TaskPlayer from "@/components/features/TaskPlayer";
import Dashbaord from "@/components/features/Dashboard";
import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { SquarePlus } from "lucide-react";
import TodoEditor from "@/components/features/TodoEditor";
import useTodoStore from "@/store/useTodoStore";
import GlobalModal from "@/components/GlobalModal";
import { useModalStore } from "@/store/useModalStore";

export default function Home() {
  const todos = useTodoStore((state) => state.todos);
  const { setTodos, addTodo, updateAllFields, setEditingTodo, moveTodo } =
    useTodoStore();
  const { openModal } = useModalStore();
  const [editingText, setEditingText] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  const handleAddTodo = () => {
    const newTodo = createTodo();
    addTodo(newTodo);
    setEditingTodo(newTodo);
    setEditingText("");
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
      const todos = useTodoStore.getState().todos; // 최신 상태 잠깐 참조
      const oldIdx = todos.findIndex((todo) => todo.id === active.id);
      const newIdx = todos.findIndex((todo) => todo.id === over.id);

      moveTodo(oldIdx, newIdx);
    }
  };

  const handleResetAllTimes = () => {
    const isConfirmed = window.confirm(
      "모든 투두의 소요 시간을 초기화하시겠습니까?"
    );

    if (isConfirmed) {
      updateAllFields("elapsedTime", 0);
    }
  };

  const handleDeleteAllTodos = () => {
    const isConfirmed = window.confirm("모든 투두를 삭제하시겠습니까?");

    if (isConfirmed) {
      setTodos([]);
    }
  };

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
            <button onClick={() => openModal(<TodoEditor />)}>
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
          <TaskPlayer />
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
                        editingText={editingText}
                        onChangeEditingText={setEditingText}
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
