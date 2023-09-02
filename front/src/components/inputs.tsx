import { forwardRef } from "react";
import classNames from "classnames";
import type { InputHTMLAttributes } from "react";
import type { LabelHTMLAttributes } from "react";

type HasErrors = {
  errors?: any;
};

/**
/* An input element.
/* @param props The props for the input.
/* @returns An input element.
*/
const Input = forwardRef<
  HTMLInputElement & HasErrors,
  InputHTMLAttributes<HTMLInputElement>
>(function Input(props, ref) {
  return (
    <input
      ref={ref}
      {...{
        ...props,
        className: classNames(
          "focus:shadow-outline w-full rounded rounded-lg border border-stone-300 bg-stone-50 p-2.5 leading-tight text-sm text-stone-900 dark:text-stone-300 outline-none focus:border-emerald-500 focus:ring-emerald-500 dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100 dark:placeholder-stone-400 dark:focus:border-emerald-500 dark:focus:ring-emerald-500",
          props.className,
        ),
      }}
    />
  );
});

const TextArea = forwardRef<
  HTMLTextAreaElement & HasErrors,
  InputHTMLAttributes<HTMLTextAreaElement>
>(function TextArea(props, ref) {
  return (
    <textarea
      ref={ref}
      {...{
        ...props,
        className: classNames(
          "focus:shadow-outline w-full rounded border border-stone-300 bg-stone-200 py-2 px-3 leading-tight text-stone-700 dark:text-stone-300 focus:outline-none focus:outline-emerald-500 dark:border-stone-600 dark:bg-stone-700",
          props.className,
        ),
      }}
    />
  );
});

const Select = forwardRef<
  HTMLSelectElement & HasErrors,
  InputHTMLAttributes<HTMLSelectElement>
>(function Select(props, ref) {
  return (
    <select
      ref={ref}
      {...{
        ...props,
        className: classNames(
          "focus:shadow-outline w-full rounded border border-stone-300 bg-stone-200 py-2 px-3 leading-tight text-stone-700 dark:text-stone-300 focus:outline-none focus:outline-emerald-500 dark:border-stone-600 dark:bg-stone-700",
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
function InputLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className="mb-2 block font-medium text-stone-600 dark:text-stone-400"
      {...props}
    />
  );
}

function InputError({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-red-500">{message}</p>;
}

function InputHelp({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-stone-500">{message}</p>;
}

function InputInfo({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-blue-500">{message}</p>;
}

function InputSuccess({ message }: { message: string }) {
  return <p className="mt-2 text-xs italic text-emerald-500">{message}</p>;
}

function InputGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

function InputGroupCommon({
  label,
  name,
  register,
  errors,
  type = "text",
}: {
  label?: string;
  name: string;
  register: any;
  errors: any;
  type?: string;
}) {
  return (
    <div className="mb-3">
      {label && <InputLabel htmlFor={name}>{label}</InputLabel>}
      <Input
        type={type}
        {...register(name)}
        className={
          errors ? "outline outline-red-500 focus:outline-red-500" : null
        }
      />
      {errors?.message && <InputError message={errors.message} />}
    </div>
  );
}

export {
  Input,
  TextArea,
  Select,
  InputLabel,
  InputGroup,
  InputGroupCommon,
  InputError,
  InputHelp,
  InputInfo,
  InputSuccess,
};
