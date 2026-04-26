"use client";

import { useModalStore } from "@/store/useModalStore";
import { useEffect, useState } from "react";
import Modal from "./common/Modal";

export default function GlobalModal() {
  const { isOpen, content, closeModal } = useModalStore();
  const [mounted, setMounted] = useState(false);

  // Next.js Hydration 에러 방지용
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return <Modal onClose={closeModal}>{content}</Modal>;
}
