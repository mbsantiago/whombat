import { forwardRef } from "react";
import classNames from "classnames";
import Spinner from "@/components/Spinner";
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
const TEXT_STYLE =
  "leading-tight text-stone-700 dark:text-stone-300 placeholder-stone-500";
const FOCUS_STYLE = "focus:ring-4 focus:outline-none focus:ring-emerald-500/50";
const COMMON_STYLE = "w-full p-2.5";
const INVALID_STYLE = "invalid:focus:ring-red-500/50 invalid:border-red-500";
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
  children,
  className,
  ...props
}: {
  children: ReactNode;
} & Omit<InputHTMLAttributes<HTMLButtonElement>, "type">) {
  return (
    <>
      <button
        type="submit"
        className={classNames(
          COMMON_STYLE,
          BORDER_STYLE,
          BACKGROUND_STYLE,
          TEXT_STYLE,
          FOCUS_STYLE,
          DISABLED_STYLE,
          className,
          "relative",
        )}
        {...props}
      >
        {children}
      </button>
    </>
  );
}
