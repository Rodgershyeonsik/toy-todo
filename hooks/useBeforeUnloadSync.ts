import { useEffect } from "react";
import useTodoStore from "@/store/useTodoStore";

export const useBeforeUnloadSync = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const todos = useTodoStore.getState().todos;
      localStorage.setItem("my-todos", JSON.stringify(todos));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
};
