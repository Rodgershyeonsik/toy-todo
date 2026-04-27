type ModalProps = {
  onClose: () => void;
  children?: React.ReactNode;
};

export default function Modal({ onClose, children }: ModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-3 min-w-75"
      >
        {children}
      </div>
    </div>
  );
}
