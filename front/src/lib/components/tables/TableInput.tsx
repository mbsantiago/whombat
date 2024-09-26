import { type HTMLProps, useEffect, useRef, useState } from "react";

import TableCell from "@/lib/components/tables/TableCell";

export default function TableInput({
  value: initialValue,
  onChange,
  ...props
}: {
  value: string;
  onChange?: (value: string | null) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(initialValue);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (active) {
      ref.current?.focus();
    }
  }, [active]);

  if (!active) {
    return (
      <TableCell
        editable={true}
        onFocus={() => {
          setActive(true);
        }}
        onClick={() => setActive(true)}
      >
        {value}
      </TableCell>
    );
  }

  return (
    <input
      ref={ref}
      className="block w-full border-transparent bg-inherit px-2 outline-transparent focus:border-gray-500 focus:ring-0 hover:dark:bg-stone-700"
      value={value as string}
      placeholder={initialValue}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setActive(false);
          setValue(initialValue);
          ref.current?.parentElement?.focus();
        } else if (e.key === "Enter") {
          setActive(false);
          onChange?.(value);
          ref.current?.parentElement?.focus();
        }
      }}
      onBlur={() => setActive(false)}
      {...props}
    />
  );
}
