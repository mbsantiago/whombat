import { type ReactNode } from "react";

export default function MetricBadge({
  icon,
  title,
  value,
  onClick,
}: {
  icon: ReactNode;
  title: ReactNode;
  value: number;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-row gap-2 items-start">
      <button className="flex-none cursor-pointer" onClick={onClick}>
        {icon}
      </button>
      <div className="flex-grow-0">
        <div className="inline-flex items-baseline gap-2">
          <span className="text-xl font-bold">{value.toLocaleString()}</span>
        </div>
        <div className="text-sm font-thin">{title}</div>
      </div>
    </div>
  );
}
