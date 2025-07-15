import type { AxiosError } from "axios";
import { useCallback } from "react";
import toast from "react-hot-toast";

import Button from "./Button";

export default function ErrorToast({
  error,
  message,
}: {
  error: AxiosError;
  message: string;
}) {
  const errorData = error.response?.data as {
    exception?: string;
    traceback?: string;
  };
  const exception = errorData?.exception;
  const traceback = errorData?.traceback;

  const hasDetailedError = exception && traceback;

  const userInstructions = hasDetailedError
    ? "Please copy the error below and report the issue to the developers (see guide on reporting errors)."
    : "Oops, an unexpected error occurred. Please try running whombat on debug mode (consult guide) and try again to see the full error message.";

  const fullErrorMessage = `
User Message: ${message}

${userInstructions}

${
  hasDetailedError
    ? `Exception:\n${exception}\n\nTraceback:\n${traceback}\n\n`
    : ""
}Full Error Details (for debugging):
${JSON.stringify(error.response, null, 2)}
  `.trim();

  const handleCopy = useCallback(
    () =>
      toast.promise(navigator.clipboard.writeText(fullErrorMessage), {
        loading: "Copying...",
        success: "Copied to clipboard",
        error: "Failed to copy",
      }),
    [fullErrorMessage],
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-red-500">{message}</p>
      <p className="mt-2 text-sm">{userInstructions}</p>
      <div className="flex flex-row gap-2 items-center">
        <Button mode="text" onClick={handleCopy}>
          Copy Error Details
        </Button>
      </div>
      {hasDetailedError && (
        <details className="p-2 text-xs rounded">
          <summary className="cursor-pointer">Show Error Information</summary>
          <pre className="overflow-y-auto mt-4 max-h-48 whitespace-pre-wrap break-all text-stone-500">
            <strong>Exception:</strong>
            <br />
            {exception}
            <br />
            <br />
            <strong>Traceback:</strong>
            <br />
            {traceback}
          </pre>
        </details>
      )}
    </div>
  );
}
