import { type ReactNode } from "react";

export default function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="p-8 w-full">
      <div className="w-full border border-dashed rounded-md border-stone-500 p-4 flex flex-col items-center justify-center text-stone-500 text-center">
        {children}
      </div>
    </div>
  );
}
