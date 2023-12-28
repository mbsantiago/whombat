import classNames from "classnames";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

import {
  BACKGROUND_STYLE,
  BORDER_STYLE,
  COMMON_STYLE,
  DISABLED_STYLE,
  FOCUS_STYLE,
  INVALID_STYLE,
  TEXT_STYLE,
} from "./styles";

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

export default Input;
