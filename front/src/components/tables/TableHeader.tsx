import type { ReactNode } from "react";

export default function TableHeader({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block whitespace-nowrap align-middle w-full overflow-x-auto">
      {children}
    </span>
  );
}
