import { type InputHTMLAttributes } from "react";

import { SearchIcon } from "@/components/icons";
import Button from "@/components/Button";
import { Input } from "@/components/inputs/index";

export default function Search({
  label = "Search",
  placeholder = "Search...",
  icon,
  value,
  onChange,
  onSubmit,
  withButton = true,
  ...props
}: {
  label?: string;
  placeholder?: string;
  icon?: React.ReactElement;
  value?: string;
  withButton?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "onChange"
  | "onSubmit"
  | "placeholder"
  | "value"
  | "id"
  | "onKeyDown"
  | "required"
  | "type"
  | "className"
>) {
  const inputId = `search-${label}`;

  // Handle enter key press
  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="flex items-center">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-8 items-center pl-3">
          {icon || <SearchIcon />}
        </div>
        <Input
          type="text"
          value={value}
          id={inputId}
          onKeyDown={onKeyPress}
          onChange={
            onChange ? (event) => onChange(event.target.value) : undefined
          }
          className="5 pl-10 text-sm"
          placeholder={placeholder}
          {...props}
        />
      </div>
      {withButton && (
        <Button
          type="submit"
          onSubmit={onSubmit}
          variant="primary"
          className="ml-2"
        >
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      )}
    </div>
  );
}
