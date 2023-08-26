import { type ReactNode } from "react";

export default function Header({ children }: { children: ReactNode }) {
  return (
    <header className="bg-stone-50 shadow dark:bg-stone-800">
      <div className="max-w-7xl px-2 py-3 sm:px-3 lg:px-6">{children}</div>
    </header>
  );
}
