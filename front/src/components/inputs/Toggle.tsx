import classNames from "classnames";
import { useRef } from "react";
import { type AriaToggleButtonProps, useToggleButton } from "react-aria";
import { useToggleState } from "react-stately";

export default function Toggle({
  label = "Toggle",
  ...props
}: {
  label?: string;
} & AriaToggleButtonProps) {
  let ref = useRef(null);
  let state = useToggleState(props);
  let { buttonProps } = useToggleButton(props, state, ref);
  return (
    <button
      {...buttonProps}
      className={classNames(
        "relative inline-flex items-center h-5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emeral-500/50",
        {
          "bg-emerald-600 dark:bg-emerald-500": state.isSelected,
          "bg-emerald-900 dark:bg-emerald-800": !state.isSelected,
        },
      )}
      ref={ref}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={classNames(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
          {
            "translate-x-7": state.isSelected,
            "translate-x-0": !state.isSelected,
          },
        )}
      />
    </button>
  );
}
