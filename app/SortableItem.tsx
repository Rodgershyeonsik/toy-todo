import { useSortable } from "@dnd-kit/sortable";
import { ReactNode } from "react";
import { CSS } from "@dnd-kit/utilities";

type SortableItemProps = {
  id: number;
  children: ReactNode;
  className: string;
};

export default function SortableItem({
  id,
  children,
  className,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={className}>
      <button
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-80"
      >
        ⠿
      </button>
      {children}
    </li>
  );
}
