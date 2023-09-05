import { forwardRef } from "react";
import classNames from "classnames";
import Spinner from "@/components/Spinner";
import Button from "@/components/Button";
import type {
  TextareaHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  LabelHTMLAttributes,
} from "react";

type HasErrors = {
  errors?: any;
};

const BORDER_STYLE = "rounded border border-stone-300 dark:border-stone-600";
const BACKGROUND_STYLE = "bg-stone-200 dark:bg-stone-700";
const TEXT_STYLE = "leading-tight text-stone-700 dark:text-stone-300";
const FOCUS_STYLE = "focus:ring-2 focus:outline-none focus:ring-emerald-500 focus:ring-offset-4 focus:ring-offset-slate-50 focus:dark:ring-offset-stone-900";
const COMMON_STYLE = "w-full p-2.5";
const INVALID_STYLE = "invalid:focus:ring-red-500 invalid:border-red-500";
const DISABLED_STYLE =
  "disabled:bg-stone-300 dark:disabled:bg-stone-800 text-stone-500 dark:text-stone-400";

/**
/* An input element.
/* @param props The props for the input.
/* @returns An input element.
*/
export const Input = forwardRef<
  HTMLInputElement & HasErrors,
  InputHTMLAttributes<HTMLInputElement>
>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...{
        ...props,
        className: classNames(
          COMMON_STYLE,
          BORDER_STYLE,
          BACKGROUND_STYLE,
          TEXT_STYLE,
          FOCUS_STYLE,
          DISABLED_STYLE,
          INVALID_STYLE,
          props.className,
        ),
      }}
    />
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement & HasErrors,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...{
        ...props,
        className: classNames(
          COMMON_STYLE,
          BORDER_STYLE,
          BACKGROUND_STYLE,
          TEXT_STYLE,
          FOCUS_STYLE,
          DISABLED_STYLE,
          INVALID_STYLE,
          props.className,
        ),
      }}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement & HasErrors,
  InputHTMLAttributes<HTMLSelectElement>
>(function Select(props, ref) {
  return (
    <select
      ref={ref}
      {...{
        ...props,
        className: classNames(
          COMMON_STYLE,
          BORDER_STYLE,
          BACKGROUND_STYLE,
          TEXT_STYLE,
          FOCUS_STYLE,
          DISABLED_STYLE,
          props.className,
        ),
      }}
    />
  );
});

/**
/* Label for an input element.
/* @param props The props for the label.
/* @returns A label for an input.
*/
export function InputLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="mb-2 block font-medium text-stone-600 dark:text-stone-400"
      {...props}
    />
  );
}

export function InputError({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-red-500">{message}</p>;
}

export function InputHelp({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-stone-500">{message}</p>;
}

export function InputInfo({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-blue-500">{message}</p>;
}

export function InputSuccess({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-emerald-500">{message}</p>;
}

function InputGroupShell({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

export function InputGroup({
  label,
  name,
  error,
  help,
  children,
}: {
  label?: string;
  name: string;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <InputGroupShell>
      {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
      {children}
      {help && <InputHelp message={help} />}
      {error && <InputError message={error} />}
    </InputGroupShell>
  );
}

export function Submit({
  loading = false,
  success = false,
  error = false,
  text = "Submit",
  loadingMessage = "Please wait. This could take a while...",
  errorMessage = "Something went wrong. Please try again.",
  successMessage = "Success! Redirecting...",
  className,
  ...props
}: {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  text?: string;
  loadingMessage?: string;
  errorMessage?: string;
  successMessage?: string;
} & Omit<InputHTMLAttributes<HTMLButtonElement>, "type">) {
  return (
    <>
      <Button
        variant={loading ? "info" : "primary"}
        type="submit"
        className={classNames(
          "m-0 w-full",
          {
            "bg-stone-500": !loading,
          },
          className,
        )}
        {...props}
      >
        {loading ? <Spinner variant="success" /> : text}
      </Button>
      {loading ? (
        <InputInfo message={loadingMessage} />
      ) : error ? (
        <InputError message={errorMessage} />
      ) : success ? (
        <InputSuccess message={successMessage} />
      ) : null}
    </>
  );
}
