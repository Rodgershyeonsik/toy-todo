import { Todo } from "@/types/todo";

export const fetchTodos = async (): Promise<Todo[]> => {
  // 브라우저 환경 확인 (Next.js 대응)
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("my-todos");
  return saved ? JSON.parse(saved) : [];
};

export const saveTodos = async (todos: Todo[]): Promise<Todo[]> => {
  localStorage.setItem("my-todos", JSON.stringify(todos));
  await new Promise((resolve) => setTimeout(resolve, 100));
  return todos;
};
