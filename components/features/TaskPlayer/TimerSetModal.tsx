import { basicButtonCn, flexCenterCn } from "@/constants/styles";
import { useModalStore } from "@/store/useModalStore";
import { cn, parseMinutes } from "@/utils";
import { TimerReset } from "lucide-react";
import { useState } from "react";

export default function TimerSetModal({
  duration,
  onSaveDuration,
}: {
  duration: number;
  onSaveDuration: (minute: number) => void;
}) {
  const { closeModal } = useModalStore();
  const [localDuration, setLocalDuration] = useState(duration);
  const [h, setH] = useState("0");
  const [m, setM] = useState("0");
  const [nowEdit, setNowEdit] = useState<null | "h" | "m">(null);

  const getHText = () => {
    const h = parseMinutes(localDuration).h;
    if (h === 0) return "00";

    if (h < 10) return "0" + h;
    return h + "";
  };

  const getMText = () => {
    const m = parseMinutes(localDuration).m;
    if (m === 0) return "00";

    if (m < 10) return "0" + m;
    return m + "";
  };

  const presetValue = [5, 10, 30];

  return (
    <form
      className={cn(flexCenterCn, "min-w-2", "flex-col", "px-3 py-2")}
      onSubmit={(e) => {
        e.preventDefault();
        onSaveDuration(localDuration * 60);
        closeModal();
      }}
    >
      {/* <div className="flex gap-1">
        {nowEdit === "h" ? (
          <input
            value={h}
            onChange={(e) => setH(e.target.value)}
            onBlur={() => onEnterTimeInput()}
            type="number"
          />
        ) : (
          <span onClick={() => setNowEdit("h")}>{getHText()}</span>
        )}
        <span>:</span>
        {nowEdit === "m" ? (
          <input value={m} onChange={(e) => setM(e.target.value)} />
        ) : (
          <span onClick={() => setNowEdit("m")}>{getMText()}</span>
        )}
      </div> */}
      <span className="m-5 text-4xl font-bold font-mono">
        {getHText()}:{getMText()}
      </span>
      <div className="flex justify-between w-full gap-1 py-3">
        <div
          className={cn(
            basicButtonCn,
            "w-15",
            "py-1",
            "bg-gray-700 border-gray-600",
            "text-white"
          )}
        >
          <TimerReset
            size={20}
            onClick={() => {
              setLocalDuration(0);
            }}
          />
        </div>
        {presetValue.map((item) => (
          <div
            key={item}
            className={cn(
              basicButtonCn,
              "p-0",
              "w-15",
              "bg-gray-700 border-gray-600",
              "text-white"
            )}
            onClick={() => setLocalDuration((prev) => prev + item)}
          >
            {`+${item}`}
          </div>
        ))}
      </div>
      <button
        type="submit"
        className={cn(
          basicButtonCn,
          "w-full",
          " border-blue-400 bg-blue-500",
          "text-white font-mono"
        )}
      >
        OK
      </button>
    </form>
  );
}
