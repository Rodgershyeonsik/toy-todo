import { useEffect } from "react";
import useTodoStore from "@/store/useTodoStore";
import useUserStore from "@/store/useUserStore";

export const useBeforeUnloadSync = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const user = useUserStore.getState().user;
      if (user) return;

      const todos = useTodoStore.getState().todos;
      localStorage.setItem("my-todos", JSON.stringify(todos));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
};
