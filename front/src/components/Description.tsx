import { type ReactNode, type FC, useState, type HTMLAttributes } from "react";
import { EditIcon } from "@/components/icons";
import classNames from "classnames";

export function DescriptionData({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <dd
      className={classNames(
        "mt-1 text-sm leading-6 text-stone-700 dark:text-stone-400 sm:col-span-2 sm:mt-0",
        className,
      )}
      {...rest}
    >
      {children}
    </dd>
  );
}

export function DescriptionTerm({
  children,
  className,
  ...rest
}: { children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <dt
      className={classNames(
        "text-sm font-medium leading-6 text-stone-900 dark:text-stone-300",
        className,
      )}
      {...rest}
    >
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
      <DescriptionData className="flex flex-row justify-between">
        {children}
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-stone-500 underline ml-2"
        >
          <EditIcon className="w-5 h-5 inline-block text-blue-500" />
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
          if (e.key === "Enter" && !e.shiftKey) {
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
