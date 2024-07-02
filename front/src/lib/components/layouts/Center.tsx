import { type ReactNode } from "react";

export default function Center({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col justify-center items-center px-16 py-8 w-full">
      {children}
    </div>
  );
}
