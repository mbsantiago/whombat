"use client";

import { useRouter } from "next/navigation";

import ErrorBase from "@/lib/components/ui/Error";

export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
} = {}) {
  const router = useRouter();
  return (
    <ErrorBase
      error={error}
      onReset={reset}
      onGoHome={() => router.push("/")}
    />
  );
}
