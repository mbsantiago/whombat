"use client";

import { WarningIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import { H2 } from "@/lib/components/ui/Headings";
import Link from "@/lib/components/ui/Link";

export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
} = {}) {
  return (
    <div className="flex flex-row justify-center items-center w-screen h-screen">
      <div className="flex flex-col gap-2 items-center">
        <WarningIcon className="w-32 h-32 text-red-500" />
        <H2 className="font-bold">Oops! Something went wrong.</H2>
        <div className="inline-flex gap-2 items-center">
          <Button mode="text" variant="warning" onClick={reset}>
            Try Again
          </Button>
          <Link mode="text" href="/">
            Go Home
          </Link>
        </div>
        <div className="flex flex-col items-center p-6 max-w-prose">
          <p className="text-center text-stone-700 dark:text-stone-300">
            We encountered an issue. Please reach out to our developers and
            provide details on what you were doing. Include the following error
            message for assistance:
          </p>
          <span className="p-4 max-w-prose text-red-500 whitespace-pre-wrap">
            {error?.message}
          </span>
        </div>
      </div>
    </div>
  );
}
