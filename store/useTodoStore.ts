import { create } from "zustand";
import { Todo } from "../types/todo";
import { arrayMove } from "@dnd-kit/sortable";

interface TodoState {
  todos: Todo[];
  quickEditingText: string;
  editingTodo: Todo | null;
  selectedTodo: Todo | null;
  setTodos: (todos: Todo[]) => void;
  setQuickEditingText: (text: string) => void;
  setEditingTodo: (todo: Todo) => void;
  addTodo: (newTodo: Todo) => void;
  patchTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  incrementTime: (id: string) => void;
  toggleTodo: (id: string, checked: boolean) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  saveQuickEdit: (text: string) => void;
  moveTodo: (oldIdx: number, newIdx: number) => void;
  updateAllFields: <K extends keyof Todo>(key: K, value: Todo[K]) => void;
}

const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  editingTodo: null,
  selectedTodo: null,
  quickEditingText: "",

  setTodos: (todos) => set({ todos }),
  setQuickEditingText: (text) => set({ quickEditingText: text }),
  setEditingTodo: (todo) => {
    return set({ editingTodo: todo });
  },
  addTodo: (newTodo) =>
    set((state) => ({
      todos: [newTodo, ...state.todos],
    })),
  patchTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
  incrementTime: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, elapsedTime: (t.elapsedTime ?? 0) + 1 } : t
      ),
    })),
  toggleTodo: (id, checked) =>
    set((state) => {
      const updatedTodos = state.todos.map((t) =>
        t.id === id ? { ...t, completed: checked } : t
      );
      const ing = updatedTodos.filter((t) => !t.completed);
      const completed = updatedTodos.filter((t) => t.completed);

      return {
        todos: [...ing, ...completed],
      };
    }),
  saveQuickEdit: (text) =>
    set((state) => {
      const target = state.editingTodo;
      if (!target) return {};

      if (!text.trim()) {
        return {
          todos: state.todos.filter((t) => t.id !== target.id),
          editingTodo: null,
        };
      }

      return {
        todos: state.todos.map((t) =>
          t.id === target.id ? { ...t, task: text } : t
        ),
        editingTodo: null,
      };
    }),
  setSelectedTodo: (todo) => set({ selectedTodo: todo }),
  moveTodo: (oldIdx, newIdx) =>
    set((state) => ({ todos: arrayMove(state.todos, oldIdx, newIdx) })),
  updateAllFields: (key, value) =>
    set((state) => ({
      todos: state.todos.map((todo) => ({
        ...todo,
        [key]: value,
      })),
    })),
}));

export default useTodoStore;
