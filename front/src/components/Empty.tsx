import type { ReactNode } from "react";

export default function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="p-8 w-full">
      <div className="flex flex-col justify-center items-center p-4 w-full text-center rounded-md border border-dashed border-stone-500 text-stone-500">
        {children}
      </div>
    </div>
  );
}
