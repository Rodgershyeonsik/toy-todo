import { basicButtonCn } from "@/constants/styles";
import { useModalStore } from "@/store/useModalStore";
import { cn } from "@/utils";

type ModalConfirmProps = {
  text: string;
  onOk?: () => void;
  onCancel?: () => void;
};

export default function ModalConfirm({
  text,
  onOk,
  onCancel,
}: ModalConfirmProps) {
  const { closeModal } = useModalStore();

  return (
    <div className="flex flex-col">
      <span className="flex justify-center py-5 text-lg">{text}</span>
      <div
        className={cn("flex w-full justify-end gap-1", {
          "justify-between": onCancel,
        })}
      >
        {onCancel && (
          <button
            className={cn(
              basicButtonCn,
              "w-1/2",
              "bg-gray-200 border-gray-300 text-gray-800"
            )}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          className={cn(
            basicButtonCn,
            onCancel ? "w-1/2" : "w-full",
            "bg-blue-500 border-blue-400 text-white"
          )}
          onClick={onOk ?? closeModal}
        >
          Ok
        </button>
      </div>
    </div>
  );
}
