import { saveTodos } from "@/api/todoApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useTodoMutation = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: saveTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    updateTodos: updateMutation.mutate,
  };
};
