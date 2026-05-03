export const fetchTodos = async () => {
  // 브라우저 환경 확인 (Next.js 대응)
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("my-todos");

  // 실제 네트워크 통신처럼 보이기 위한 지연
  await new Promise((resolve) => setTimeout(resolve, 500));

  return saved ? JSON.parse(saved) : [];
};
