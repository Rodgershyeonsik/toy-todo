import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
  upsertTodoAction,
} from "@/actions/todoActions";
import { saveTodos } from "@/api/todoApi";
import useUserStore from "@/store/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTodoMutation = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

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
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoAction,
  });

  return {
    updateTodos: updateTodosMutation.mutate,
    addTodo: addMutation.mutate,
    addTodoAsync: addMutation.mutateAsync,
    updateTodo: updateMutation.mutate,
    updateTodoAsync: updateMutation.mutateAsync,
    upsertTodo: upsertMutation.mutate,
    deleteTodo: deleteMutation.mutate,
  };
};
