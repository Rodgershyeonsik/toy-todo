import { getTodos } from "@/actions/todoActions";
import { fetchTodos } from "@/api/todoApi";
import useTodoStore from "@/store/useTodoStore";
import useUserStore from "@/store/useUserStore";
import { Todo } from "@/types/todo";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useTodos = () => {
  const setTodos = useTodoStore((state) => state.setTodos);
  const user = useUserStore((state) => state.user);

  const query = useQuery<Todo[], Error>({
    queryKey: user ? ["todos", user.id] : ["todos"],
    queryFn: user ? getTodos : fetchTodos,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      if (user) {
        const currentTodos = useTodoStore.getState().todos;
        const merged = query.data.map((todo) => ({
          ...todo,
          isRunning:
            currentTodos.find((t) => t.id === todo.id)?.isRunning ?? false,
        }));
        setTodos(merged);
      } else {
        setTodos(query.data);
      }
    }
  }, [query.data, setTodos]);

  return query;
};
