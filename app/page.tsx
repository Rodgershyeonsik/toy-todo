"use client"
import { useState } from "react";

interface Todo {
  id: number;
  task: string;
  isComplete: boolean;
}

export default function Home() {

  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: '아침 먹기', isComplete: false, },
    { id: 2, task: '점심 먹기', isComplete: false, },
    { id: 3, task: '저녁 먹기', isComplete: false, },
  ]);

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-2xl px-6 py-10">
        <header>
        <h1 className="text-3xl font-bold">
          TODO LIST
        </h1>
        <span className="text-sm text-gray-500">
          할 일을 정리하고 완료해보십시다리^ㅡ^
        </span>
        </header>

        <main>
          <div className="py-5">
            <ul className="list-none space-y-2">
              {todos.map((todo) => (
                <li key={todo.id}>
                  <label className="flex items-center gap-1.5">
                    <input 
                    type='checkbox' 
                    checked={todo.isComplete} 
                    onChange={(e) => { 
                      setTodos(
                        prevTodos => prevTodos.map((t) =>
                          t.id === todo.id ? { ...t, isComplete: e.target.checked } : t)
                      );
                      }}/>
                    <span className="text-xl">{todo.task}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}