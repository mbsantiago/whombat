import { type ReactNode } from "react";

export default function SettingsSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 p-4 w-full max-w-md rounded-md border dark:border-stone-600">
      {children}
    </div>
  );
}
