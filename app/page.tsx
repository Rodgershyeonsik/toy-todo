"use client"
import { useState } from "react";

interface Todo {
  task: string;
  isComplete: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <header>
      <h1 className="text-3xl font-bold">
        TODO LIST
      </h1>
    <p className="text-sm text-gray-500">
      할 일을 정리하고 완료해보십시다리~
    </p>
    </header>
  );
}