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
import useUserStore from "@/store/useUserStore";
import { useDailyLogs } from "@/hooks/useDailyLogs";
import { useEffect } from "react";
import ModalConfirm from "@/components/common/ModalConfirm";

const loginMsg = `지금 저장된 작업 기록은 이 브라우저에만 있고,
로그인 계정으로 옮겨지지 않아요.
계속할까요?`;

export default function Home() {
  const {
    data: userTodos,
    isLoading: todosLoading,
    isError: todosError,
  } = useTodos();
  const {
    data: dailyLogs,
    isLoading: logsLoading,
    isError: logsError,
  } = useDailyLogs();
  const user = useUserStore((state) => state.user);
  const todos = useTodoStore((state) => state.todos);
  const {
    setTodos,
    addTodo,
    updateAllFields,
    setEditingTodo,
    moveTodo,
    setQuickEditingText,
  } = useTodoStore((state) => state.actions);
  const { openModal, closeModal } = useModalStore();
  const { isLoading: userIsLoading, signInWithGoogle, signOut } = useAuth();

  const handleAddNewTodo = () => {
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

  useEffect(() => {
    const currentTodos = useTodoStore.getState().todos;
    if (!user && userTodos) {
      setTodos(userTodos);
    } else if (
      user &&
      !logsLoading &&
      !todosLoading &&
      userTodos &&
      dailyLogs
    ) {
      const merge = userTodos?.map((t) => ({
        ...t,
        elapsedTime:
          dailyLogs?.find((log) => log.todoId === t.id)?.elapsedTime ?? 0,
        isRunning:
          currentTodos.find((ct) => ct.id === t.id)?.isRunning ?? false,
      }));
      setTodos(merge ?? []);
    }
  }, [user, userTodos, dailyLogs, logsLoading, todosLoading]);

  useBeforeUnloadSync();

  if (todosLoading || userIsLoading || logsLoading)
    return (
      <div className={cn(flexCenterCn, "w-full h-screen")}>
        <span> LOADING...</span>
      </div>
    );

  if (todosError || logsError)
    return (
      <div className={cn(flexCenterCn, "w-full h-screen")}>
        <span>
          데이터 불러오기 실패<br></br>다시 시도해주세요
        </span>
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
                    className="flex h-10 gap-2 items-center px-2 rounded border-2 border-gray-200 bg-[#F2F2F2] cursor-pointer"
                  >
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="profile"
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-md text-gray-800 font-sans">
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    openModal(
                      <ModalConfirm
                        title={"⚠️ 로그인 전 확인"}
                        text={loginMsg}
                        onOk={signInWithGoogle}
                        onCancel={closeModal}
                      />
                    )
                  }
                >
                  <img
                    src="/web_neutral_sq_SU.svg"
                    alt="Sign in with Google"
                    className="cursor-pointer"
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
            <button
              className="text-lg text-gray-400"
              onClick={handleAddNewTodo}
            >
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
            <RenderingTest />
          </div>
        </main>
      </div>
    </div>
  );
}

function RenderingTest({}) {
  const {
    setTodos,
    addTodo,
    updateAllFields,
    setEditingTodo,
    moveTodo,
    setQuickEditingText,
  } = useTodoStore((state) => state.actions);

  return <span>useStore 객체 통 리렌더링 테스트</span>;
}
