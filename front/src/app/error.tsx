"use client";
import { H2 } from "@/lib/components/ui/Headings";
import { WarningIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Link from "@/lib/components/ui/Link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-screen h-screen flex flex-row justify-center items-center">
      <div className="flex flex-col items-center gap-2">
        <WarningIcon className="w-32 h-32 text-red-500" />
        <H2 className="font-bold">Oops! Something went wrong.</H2>
        <div className="inline-flex items-center gap-2">
          <Button mode="text" variant="warning" onClick={reset}>
            Try Again
          </Button>
          <Link mode="text" href="/">
            Go Home
          </Link>
        </div>
        <div className="flex flex-col items-center max-w-prose p-6">
          <p className="dark:text-stone-300 text-stone-700 text-center">
            We encountered an issue. Please reach out to our developers and
            provide details on what you were doing. Include the following error
            message for assistance:
          </p>
          <span className="max-w-prose whitespace-pre-wrap text-red-500 p-4">
            {error.message}
          </span>
        </div>
      </div>
    </div>
  );
}
