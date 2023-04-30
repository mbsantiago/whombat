/** Input component. */

import { forwardRef } from "react";
import classNames from "classnames";
import type { InputHTMLAttributes } from "react";

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

export default Input;
