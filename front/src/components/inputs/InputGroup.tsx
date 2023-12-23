import type { LabelHTMLAttributes, ReactNode } from "react";

/**
/* Label for an input element.
/* @param props The props for the label.
/* @returns A label for an input.
*/
export function InputLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="block mb-2 font-medium text-stone-600 dark:text-stone-400"
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

export default function InputGroup({
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
