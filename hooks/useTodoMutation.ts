import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "@/actions/todoActions";
import { saveTodos } from "@/api/todoApi";
import useUserStore from "@/store/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTodoMutation = () => {
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: ({
      task,
      dailyGoalTime,
    }: {
      task: string;
      dailyGoalTime?: number;
    }) => createTodoAction(task, dailyGoalTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: saveTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodoAction,
  });

  return {
    addTodo: addMutation.mutate,
    updateTodos: updateMutation.mutate,
    deleteTodo: deleteMutation.mutate,
  };
};
