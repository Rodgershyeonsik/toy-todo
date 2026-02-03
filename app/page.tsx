"use client"
import { useState } from "react";

interface Todo {
  task: string;
  isComplete: boolean;
}

export default function Home() {

  const [todos, setTodos] = useState<Todo[]>([
    { task: '아침 먹기', isComplete: false, },
    { task: '점심 먹기', isComplete: false, },
    { task: '저녁 먹기', isComplete: false, },
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
                <li>
                  <label className="flex items-center gap-1.5">
                    <input type='checkbox' checked={todo.isComplete} />
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