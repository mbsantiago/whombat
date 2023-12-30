import type { ReactNode } from "react";

export default function Empty({
  children,
  padding = "p-8",
}: {
  children: ReactNode;
  padding?: string;
}) {
  return (
    <div className={`${padding} w-full`}>
      <div className="flex flex-col justify-center items-center p-4 w-full text-center rounded-md border border-dashed border-stone-500 text-stone-500">
        {children}
      </div>
    </div>
  );
}
