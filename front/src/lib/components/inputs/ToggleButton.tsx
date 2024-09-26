import classNames from "classnames";

const DEFAULT_STYLE = classNames(
  "py-2 px-4 text-sm font-medium",
  "bg-stone-100 dark:bg-stone-800",
  "border-stone-200 dark:border-stone-700 ",
  "dark:text-stone-100 focus:text-emerald-700 text-stone-900 dark:focus:text-stone-100",
  "hover:text-emerald-700 dark:hover:text-stone-100 dark:hover:bg-stone-700 hover:bg-stone-100",
  "focus:z-10 focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500",
);

const UNSET_STYLE = classNames(
  "py-2 px-4 text-sm font-medium",
  "bg-stone-200 dark:bg-stone-700",
  "border-stone-300 dark:border-stone-600 ",
  "dark:text-stone-100 text-stone-900",
);

const YES_STYLE = classNames(
  "py-2 px-4 text-sm font-medium",
  "bg-emerald-200 dark:bg-emerald-700",
  "border-emerald-300 dark:border-emerald-600 ",
  "dark:text-emerald-100 text-emerald-900",
);

const NO_STYLE = classNames(
  "py-2 px-4 text-sm font-medium",
  "bg-rose-200 dark:bg-rose-700",
  "border-rose-300 dark:border-rose-600",
  "dark:text-rose-100 text-rose-900",
);

export default function ToggleButton({
  checked,
  onChange,
  onClear,
}: {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  onClear?: () => void;
}) {
  return (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={onClear}
        className={classNames(
          "rounded-s-lg border",
          checked == null ? UNSET_STYLE : DEFAULT_STYLE,
        )}
        disabled={checked == null}
      >
        unset
      </button>
      <button
        type="button"
        onClick={() => onChange?.(true)}
        className={classNames(
          "border-t border-b",
          checked == true ? YES_STYLE : DEFAULT_STYLE,
        )}
        disabled={checked == true}
      >
        yes
      </button>
      <button
        type="button"
        onClick={() => onChange?.(false)}
        className={classNames(
          "border rounded-e-lg",
          checked == false ? NO_STYLE : DEFAULT_STYLE,
        )}
        disabled={checked == false}
      >
        no
      </button>
    </div>
  );
}
