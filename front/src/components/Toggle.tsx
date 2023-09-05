import { Switch } from "@headlessui/react";

export default function Toggle({
  checked,
  onChange,
  label = "Toggle",
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${checked ? "bg-emerald-900 dark:bg-emerald-500" : "bg-emerald-700 dark:bg-emerald-800"}
          relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`${checked ? "translate-x-7" : "translate-x-0"}
            pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  );
}
