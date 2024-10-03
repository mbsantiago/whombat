import type { ReactNode } from "react";

import Spinner from "@/lib/components/ui/Spinner";

export default function WithLoading({
  isLoading,
  children,
  show = true,
}: {
  isLoading: boolean;
  loadingMessage?: string;
  children: ReactNode;
  show?: boolean;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <>
      <div className="relative max-w-fit max-h-fit">
        {show ?? children}
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-stone-500/50 ">
          <Spinner />
        </div>
      </div>
    </>
  );
}
