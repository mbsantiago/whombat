import { type ReactNode } from "react";

export default function Center({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center p-16 w-full">
      {children}
    </div>
  );
}
