import { fetchTodos } from "@/api/todoApi";
import useTodoStore from "@/store/useTodoStore";
import { Todo } from "@/types/todo";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useTodos = () => {
  const setTodos = useTodoStore((state) => state.setTodos);

  const query = useQuery<Todo[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    // v5에서는 staleTime을 0보다 크게 잡는 것이
    // 불필요한 로컬스토리지 접근을 줄이는 데 도움이 됩니다.
    staleTime: 1000 * 60 * 5,
  });

  // TanStack Query v5 대응: 데이터가 변경될 때마다 Zustand 동기화
  useEffect(() => {
    console.log("useTodos useEffect");
    if (query.data) {
      setTodos(query.data);
    }
  }, [query.data, setTodos]);

  return query;
};
