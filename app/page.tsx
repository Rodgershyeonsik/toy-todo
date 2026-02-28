"use client";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRef, useState } from "react";
import SortableItem from "./SortableItem";
import { Todo } from "./types/todo";
import TodoItem from "./TodoItem";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: "아침 먹기", completed: false },
    { id: 2, task: "점심 먹기", completed: false },
    { id: 3, task: "저녁 먹기", completed: false },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const idRef = useRef(3);

  const handleAddTodo = () => {
    idRef.current += 1;
    const newTodo = { id: idRef.current, task: "", completed: false };
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setEditingId(newTodo.id);
    setEditingText("");
  };

  const handleCheckTodo = (checked: boolean, todo: Todo) => {
    setTodos((prevTodos) => {
      const newTodo = prevTodos.map((t) =>
        t.id === todo.id ? { ...t, completed: checked } : t
      );

      const ing = newTodo.filter((t) => !t.completed);
      const completed = newTodo.filter((t) => t.completed);

      return [...ing, ...completed];
    });
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.task);
  };

  const saveEdit = (id: number) => {
    setTodos((prev) => {
      if (!editingText.trim()) {
        return prev.filter((t) => t.id !== id);
      }

      return prev.map((t) => (t.id === id ? { ...t, task: editingText } : t));
    });
    setEditingId(null);
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id != over.id) {
      setTodos((prev) => {
        const oldIdx = prev.findIndex((todo) => todo.id === Number(active.id));
        const newIdx = prev.findIndex((todo) => todo.id === Number(over.id));

        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-lg px-6 py-10">
        <header>
          <h1 className="text-3xl font-bold">TODO LIST</h1>
          <span className="text-sm text-gray-500">
            할 일을 정리하고 완료해보십시다리^ㅡ^
          </span>
        </header>

        <main>
          <div className="py-5">
            <button className="text-lg text-gray-400" onClick={handleAddTodo}>
              {" "}
              + 할 일 추가...
            </button>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map((todo) => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="list-none space-y-2">
                  {todos.map((todo) => (
                    <SortableItem
                      key={todo.id}
                      id={todo.id}
                      className="flex items-center gap-2 group"
                    >
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        isEditing={editingId === todo.id}
                        editingText={editingText}
                        onToggle={handleCheckTodo}
                        onStartEdit={startEdit}
                        onChangeEditingText={setEditingText}
                        onSave={saveEdit}
                        onDelete={deleteTodo}
                      />
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        </main>
      </div>
    </div>
  );
}
