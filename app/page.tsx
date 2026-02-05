"use client"
import { useState } from "react";

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

export default function Home() {

  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, task: '아침 먹기', completed: false, },
    { id: 2, task: '점심 먹기', completed: false, },
    { id: 3, task: '저녁 먹기', completed: false, },
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
                  <label className="flex items-center gap-2">
                    <input 
                    type='checkbox' 
                    className="scale-125"
                    checked={todo.completed} 
                    onChange={(e) => { 
                      setTodos(
                        prevTodos => {
                          const newTodo = prevTodos.map((t) =>
                          t.id === todo.id ? { ...t, completed: e.target.checked } : t);

                          const ing = newTodo.filter((t) => !t.completed);
                          const completed = newTodo.filter((t) => t.completed);

                          return [...ing, ...completed];
                        }
                      );
                      }}/>
                    <span className={`text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}>{todo.task}</span>
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