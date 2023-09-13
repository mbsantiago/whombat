import { type ReactNode } from "react";
import Spinner from "@/components/Spinner";

export default function WithLoading({
  isLoading,
  children,
}: {
  isLoading: boolean;
  loadingMessage?: string;
  children: ReactNode;
}) {
  if (!isLoading) return <>{children}</>;

  return (
    <>
      <div className="relative max-w-fit max-h-fit">
        {children}
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-stone-500/50 ">
          <Spinner />
        </div>
      </div>
    </>
  );
}
