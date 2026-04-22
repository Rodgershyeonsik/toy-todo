import { create } from "zustand";
import { Todo } from "../types/todo";

interface TodoState {
  todos: Todo[];
  selectedTodo: Todo | null;
  addTodo: (newTodo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  setSelectedTodo: (todo: Todo | null) => void;
}

const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  selectedTodo: null,
  addTodo: (newTodo) =>
    set((state) => ({
      todos: [newTodo, ...state.todos],
    })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  setSelectedTodo: (todo) => set({ selectedTodo: todo }),
}));

export default useTodoStore;
