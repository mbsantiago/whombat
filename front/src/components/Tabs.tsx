import { type ButtonHTMLAttributes, type ReactNode } from "react";
import classnames from "classnames";

type TabType = {
  id: string | number;
  icon?: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
};

function Tab({
  children,
  disabled,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={classnames(
        "whitespace-nowrap rounded-lg bg-stone-50 p-2 text-center text-sm font-medium dark:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/50",
        {
          "text-emerald-500": disabled,
          "text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300":
            !disabled,
        },
      )}
    >
      {children}
    </button>
  );
}

export default function Tabs({ tabs }: { tabs: TabType[] }) {
  return (
    <ul className="flex space-x-4">
      {tabs.map((tab) => (
        <li key={tab.id}>
          <Tab onClick={tab.onClick} disabled={tab.isActive}>
            {tab.icon ? (
              <span className="mr-2 inline-block align-middle text-stone-500">
                {tab.icon}
              </span>
            ) : null}
            {tab.title}
          </Tab>
        </li>
      ))}
    </ul>
  );
}
