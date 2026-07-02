import { getTodosAction } from "@/actions/todoActions";
import { fetchTodos } from "@/api/todoApi";
import useUserStore from "@/store/useUserStore";
import { Todo } from "@/types/todo";
import { useQuery } from "@tanstack/react-query";

export const useTodos = () => {
  const user = useUserStore((state) => state.user);

  const query = useQuery<Todo[], Error>({
    queryKey: user ? ["todos", user.id] : ["todos"],
    queryFn: user ? getTodosAction : fetchTodos,
    staleTime: 1000 * 60 * 5,
  });

  return query;
};
