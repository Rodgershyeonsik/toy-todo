"use client";

import { useModalStore } from "@/store/useModalStore";
import { cn } from "@/utils";
import { ChartColumnBig, Menu, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TodoEditor from "./TodoEditor";

const menuItemCn =
  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-md text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer";

export default function AppMenu() {
  const router = useRouter();
  const openModal = useModalStore((state) => state.openModal);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const menuItems = [
    {
      label: "할 일 추가",
      icon: <Plus size={18} />,
      onClick: () => openModal(<TodoEditor />),
    },
    {
      label: "작업 통계",
      icon: <ChartColumnBig size={18} />,
      onClick: () => router.push("/stats"),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        <Menu
          className={cn(
            "text-gray-400 hover:text-blue-400 transition-colors",
            isOpen && "text-blue-400"
          )}
          size={40}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-100 mt-1 w-40 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={menuItemCn}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
