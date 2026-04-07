import { CircleX } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-3 min-w-75"
      >
        <div className="flex justify-end">
          <button onClick={onClose}>
            <CircleX color="#c8c1c1" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
