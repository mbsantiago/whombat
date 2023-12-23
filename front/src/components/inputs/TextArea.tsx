import { forwardRef } from "react";
import classNames from "classnames";
import type { TextareaHTMLAttributes } from "react";
import {
  COMMON_STYLE,
  BORDER_STYLE,
  BACKGROUND_STYLE,
  TEXT_STYLE,
  FOCUS_STYLE,
  DISABLED_STYLE,
  INVALID_STYLE,
} from "./styles";

type HasErrors = {
  errors?: any;
};

const TextArea = forwardRef<
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

export default TextArea;
