"use client";

import { createClient } from "@/lib/supabase/client";
import { formatTimeToEn } from "@/utils";
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

  const googleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <>
      <div>
        <button onClick={handleTest}>Supabase 연결 테스트</button>
        {result && <p>{result}</p>}
      </div>
      <div>
        <button onClick={googleLogin}>구글 로그인 테스트</button>
      </div>
      <div>
        <button onClick={handleLogout}>supabase 로그아웃</button>
      </div>
      <div>{formatTimeToEn(3600)}</div>
    </>
  );
}
