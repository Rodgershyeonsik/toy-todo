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
import SortableItem from "@/components/features/SortableItem";
import { createTodo } from "@/types/todo";
import TodoItem from "@/components/features/TodoItem";
import TaskPlayer from "@/components/features/TaskPlayer";
import Dashbaord from "@/components/features/Dashboard";
import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { SquarePlus } from "lucide-react";
import TodoEditor from "@/components/features/TodoEditor";
import useTodoStore from "@/store/useTodoStore";
import { useModalStore } from "@/store/useModalStore";
import { cn } from "@/utils";
import { useTodos } from "@/hooks/useTodos";
import { useBeforeUnloadSync } from "@/hooks/useBeforeUnloadSync";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isLoading } = useTodos();
  const todos = useTodoStore((state) => state.todos);
  const {
    setTodos,
    addTodo,
    updateAllFields,
    setEditingTodo,
    moveTodo,
    setQuickEditingText,
  } = useTodoStore();
  const { openModal } = useModalStore();
  const {
    user,
    isLoading: userIsLoading,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const handleAddTodo = () => {
    const newTodo = createTodo();
    addTodo(newTodo);
    setEditingTodo(newTodo);
    setQuickEditingText("");
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

  useBeforeUnloadSync();

  if (isLoading)
    return (
      <div className={cn(flexCenterCn, "w-full h-screen")}>
        <span> LOADING...</span>
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg px-6 py-5">
        <header>
          <div className="flex flex-col">
            <div className="flex justify-end">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={signOut}
                    className="flex justify-around items-center px-2.5 py-1.5 gap-1 hover:bg-gray-300 rounded border border-gray-300 bg-[#F2F2F2]"
                  >
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-md font-semibold text-gray-500">
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <button onClick={signInWithGoogle}>
                  <img
                    src="/web_neutral_sq_SU.svg"
                    alt="Sign in with Google"
                  ></img>
                </button>
              )}
            </div>
            <div className="flex justify-between items-start mt-2">
              <div>
                <h1 className="text-3xl font-bold">FOCUS DO!</h1>
                <span className="text-sm text-gray-500">
                  할 일들의 소요시간을 기록하고 관리해보자
                </span>
              </div>
              <button onClick={() => openModal(<TodoEditor />)}>
                <SquarePlus
                  className="text-gray-400 hover:text-blue-400"
                  size={40}
                />
              </button>
            </div>
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
          <Dashbaord />
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
                      <TodoItem key={todo.id} todo={todo} />
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
