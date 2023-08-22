import { forwardRef } from "react";
import classNames from "classnames";
import type { InputHTMLAttributes } from "react";
import type { LabelHTMLAttributes } from "react";

/**
/* An input element.
/* @param props The props for the input.
/* @returns An input element.
*/
const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    ref={ref}
    {...{
      ...props,
      className: classNames(
        "focus:shadow-outline w-full rounded border border-stone-300 bg-stone-200 py-2 px-3 leading-tight text-stone-700 focus:outline-none focus:outline-emerald-500 dark:border-stone-100 dark:bg-stone-200",
        props.className
      ),
    }}
  />
));

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

function InputGroup({
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
      {errors?.message && (
        <p className="text-xs italic text-red-500 mt-2">{errors.message}</p>
      )}
    </div>
  );
}

export { Input, InputLabel, InputGroup };
