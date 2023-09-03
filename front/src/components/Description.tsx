import { type ReactNode, type FC, useState } from "react";
import { EditIcon } from "@/components/icons";

export function DescriptionData({ children }: { children: ReactNode }) {
  return (
    <dd className="mt-1 text-sm leading-6 text-stone-700 dark:text-stone-400 sm:col-span-2 sm:mt-0">
      {children}
    </dd>
  );
}

export function DescriptionTerm({ children }: { children: ReactNode }) {
  return (
    <dt className="text-sm font-medium leading-6 text-stone-900 dark:text-stone-300">
      {children}
    </dt>
  );
}


export function EditableDescriptionData<T, S>({
  children,
  Input,
  value,
  onChange,
  ...props
}: {
  children: ReactNode;
  Input: FC<S>;
  value: T;
  onChange: (value: T) => void;
} & Omit<S, "onBlur" | "onKeyDown" | "value" | "onChange">) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState<T>(value);

  if (!editing) {
    return (
      <DescriptionData>
        {children}
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-stone-500 underline ml-2"
        >
          <EditIcon className="w-4 h-4 inline-block" />
        </button>
      </DescriptionData>
    );
  }

  return (
    <DescriptionData>
      {/* @ts-ignore */}
      <Input
        value={localValue}
        /* @ts-ignore */
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(localValue);
            setEditing(false);
          }
          if (e.key === "Escape") {
            setLocalValue(value);
            setEditing(false);
          }
        }}
        onBlur={() => {
          setLocalValue(value);
          setEditing(false);
        }}
        /* @ts-ignore */
        onChange={(e) => setLocalValue(e.target.value as T)}
        {...props}
      />
    </DescriptionData>
  );
}
