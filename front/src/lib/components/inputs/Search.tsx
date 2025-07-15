import { ReactElement, useRef } from "react";
import type { InputHTMLAttributes } from "react";
import { VisuallyHidden, useSearchField } from "react-aria";
import { type SearchFieldProps, useSearchFieldState } from "react-stately";

import { CloseIcon, SearchIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Loading from "@/lib/components/ui/Loading";

import Input from "./Input";

/**
 * Search component that provides a search input field with optional loading
 * and clear button functionality.
 */
export default function Search({
  label = "Search",
  placeholder = "Search...",
  isLoading = false,
  icon,
  ...props
}: {
  /** The label for the search field. */
  placeholder?: string;
  /** Flag to indicate if the search is in a loading state. */
  isLoading?: boolean;
  /** Optional icon to display in the search input. */
  icon?: ReactElement;
} & SearchFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "spellCheck">) {
  const state = useSearchFieldState({ label, ...props });
  const ref = useRef(null);

  const { labelProps, inputProps, clearButtonProps } = useSearchField(
    { label, ...props },
    state,
    ref,
  );

  return (
    <div className="flex items-center">
      <VisuallyHidden>
        <label {...labelProps}>{label}</label>
      </VisuallyHidden>
      <div className="relative w-full">
        <div className="flex absolute inset-y-0 left-0 items-center pl-3 w-8 pointer-events-none">
          {isLoading ? <Loading /> : icon || <SearchIcon />}
        </div>
        <Input className="pl-10 text-sm 5" ref={ref} {...inputProps} />
        {state.value !== "" && (
          <Button
            variant="primary"
            mode="text"
            className="flex absolute inset-y-0 right-0 items-center ml-2"
            // @ts-ignore
            onClick={clearButtonProps.onPress}
          >
            <CloseIcon className="w-4 h-4" />
            <span className="sr-only">{label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
