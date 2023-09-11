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
      className={`${checked ? "bg-emerald-600 dark:bg-emerald-500" : "bg-emerald-900 dark:bg-emerald-800"}
          relative inline-flex h-5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emeral-500/50`}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className={`${checked ? "translate-x-7" : "translate-x-0"}
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  );
}
