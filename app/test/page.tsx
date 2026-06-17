"use client";

import { createTodo, getTodos } from "@/actions/todoActions";
import { createClient } from "@/lib/supabase/client";
import { googleLogin, handleLogout } from "@/utils/login";
import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<string>("");

  const handleTest = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setResult(`에러: ${error.message}`);
    } else {
      setResult(`연결 성공! 세션: ${data.session ? "로그인 중" : "비로그인"}`);
    }
  };

  return (
    <>
      <div>
        <button onClick={handleTest}>Supabase 연결 테스트</button>
        {result && <p>{result}</p>}
      </div>
      <div>
        <button
          onClick={() =>
            createTodo("테스트 할 일1", 30)
              .then(console.log)
              .catch(console.error)
          }
        >
          createTodo 테스트
        </button>
      </div>
      <div>
        <button
          onClick={() => getTodos().then(console.log).catch(console.error)}
        >
          createTodo 테스트
        </button>
      </div>
    </>
  );
}
