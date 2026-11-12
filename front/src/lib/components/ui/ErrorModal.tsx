import { type AxiosError } from "axios";

import Button from "@/lib/components/ui/Button";
import { ErrorSchema } from "@/lib/schemas/error";

import { CloseIcon } from "../icons";

export const parseAxiosError = (error: AxiosError) => {
  const response = error.response;

  if (response?.data) {
    const result = ErrorSchema.safeParse(response.data);

    if (result.success) {
      // result.data is now typed as one of your specific error schemas
      return {
        title: result.data.error_type,
        displayMessage: result.data.message,
        technicalDetails: {
          status: response.status,
          ...result.data,
        },
      };
    }

    // Fallback if data exists but doesn't match our specific schemas
    return {
      title: "Unknown Server Error",
      displayMessage:
        (response.data as any).message || "An unexpected error occurred.",
      technicalDetails: {
        status: response.status,
        rawResponse: response.data,
      },
    };
  }

  // Network/Client Error Fallback
  return {
    title: error.code || "Connection Error",
    displayMessage: error.message,
    technicalDetails: {
      code: error.code,
      stack: error.stack,
    },
  };
};

interface ErrorModalProps {
  message: string;
  error: AxiosError;
  onClose?: () => void;
  onCopy?: () => void;
}

export default function ErrorModal({
  message = "Error Details",
  error,
  onClose,
  onCopy,
}: ErrorModalProps) {
  const { title, displayMessage, technicalDetails } = parseAxiosError(error);
  const jsonOutput = JSON.stringify(technicalDetails, null, 2);

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-stone-900/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="overflow-hidden p-6 w-full max-w-3xl text-left rounded-2xl shadow-xl transition-all transform bg-stone-50 text-stone-700 dark:bg-stone-700 dark:text-stone-300">
        {/* Header */}
        <div className="flex flex-row gap-4 justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-stone-900 dark:text-stone-100">
            {message}
          </h3>
          <Button
            onClick={onClose}
            mode="text"
            variant="secondary"
            padding="p-1"
          >
            <CloseIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Primary User Feedback */}
        <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 mb-4">
          <h4 className="mb-1 font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            {title}
          </h4>
          <p className="text-sm leading-relaxed text-stone-800 dark:text-stone-200">
            {displayMessage}
          </p>
        </div>

        {/* Technical Log Section */}
        <div className="relative group">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold tracking-widest uppercase text-[10px] text-stone-400">
              Debug Information
            </span>
          </div>
          <pre className="overflow-auto p-4 max-h-64 font-mono leading-relaxed text-emerald-400 rounded-lg border shadow-inner text-[11px] bg-stone-900 border-stone-800">
            <code>{jsonOutput}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end py-4 px-6">
          <Button onClick={onClose} mode="text" variant="secondary">
            Close
          </Button>
          <Button onClick={onCopy} mode="text">
            Copy Details
          </Button>
        </div>
      </div>
    </div>
  );
}
