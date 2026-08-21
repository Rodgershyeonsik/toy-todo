import {
  archiveTodoAction,
  createTodoAction,
  deleteTodoAction,
  unarchiveTodoAction,
  updateTodoAction,
  upsertTodoAction,
} from "@/actions/todoActions";
import { saveTodos } from "@/api/todoApi";
import useUserStore from "@/store/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTodoMutation = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const handleMutationError = () => {
    toast.error("데이터 동기화에 실패했습니다.");
    queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
  };

  const updateTodosMutation = useMutation({
    mutationFn: saveTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: ({
      id,
      task,
      dailyGoalTime,
    }: {
      id: string;
      task: string;
      dailyGoalTime: number | null;
    }) => createTodoAction(id, task, dailyGoalTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
    // 실패 처리는 TodoEditor에서 스냅샷 복원(수동 롤백)으로 담당
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        task: string;
        completed?: boolean;
        dailyGoalTime: number | null;
        order?: number;
      };
    }) => updateTodoAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
    // 실패 처리는 TodoEditor에서 스냅샷 복원(수동 롤백)으로 담당
  });

  const upsertMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        task: string;
        completed: boolean;
        dailyGoalTime: number | null;
        order?: number;
      };
    }) => upsertTodoAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
    onError: handleMutationError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoAction,
    onError: handleMutationError,
  });

  const archiveMutation = useMutation({
    mutationFn: archiveTodoAction,
    onError: handleMutationError,
  });

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveTodoAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
    onError: handleMutationError,
  });

  return {
    updateTodos: updateTodosMutation.mutate,
    addTodo: addMutation.mutate,
    addTodoAsync: addMutation.mutateAsync,
    updateTodo: updateMutation.mutate,
    updateTodoAsync: updateMutation.mutateAsync,
    upsertTodo: upsertMutation.mutate,
    deleteTodo: deleteMutation.mutate,
    archiveTodo: archiveMutation.mutate,
    unarchiveTodo: unarchiveMutation.mutate,
  };
};
