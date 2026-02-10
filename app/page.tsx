"use client"
import { useRef, useState } from "react";

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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const idRef = useRef(3);

  const handleAddTodo = () => {
    idRef.current += 1;
    const newTodo = {id: idRef.current, task: "", completed: false,};
    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setEditingId(newTodo.id);
    setEditingText("");
  };

  const handleCheckTodo = (checked: boolean, todo: Todo) => {
    setTodos(
              prevTodos => {
                const newTodo = prevTodos.map((t) =>
                t.id === todo.id ? { ...t, completed: checked } : t);

                const ing = newTodo.filter((t) => !t.completed);
                const completed = newTodo.filter((t) => t.completed);

                return [...ing, ...completed];
              }
    );
  }

  const startEdit = (todo: Todo) => {
      setEditingId(todo.id);
      setEditingText(todo.task);
  };

  const saveEdit = (id: number) => {
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, task: editingText } : t
      )
    );
    setEditingId(null);
  };

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
            <button className="text-lg text-gray-400" onClick={handleAddTodo}> + 할 일 추가...</button>
            <ul className="list-none space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-2">
                  <input 
                  type='checkbox' 
                  className="scale-125"
                  checked={todo.completed} 
                  onChange={(e) => handleCheckTodo(e.target.checked, todo)}/>
                  {editingId === todo.id ?  
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                      autoFocus
                      className="text-lg border px-1"
                    />
                    : <span 
                    className={
                      `text-lg 
                      ${todo.completed ? 'line-through text-gray-400' : ''} 
                      ${!todo.task && 'text-gray-400'}`}
                    onClick={() => startEdit(todo)}>
                      {todo.task || '할 일을 입력하세요'}</span>}
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}