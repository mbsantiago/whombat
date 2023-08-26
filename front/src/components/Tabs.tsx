import { type ReactNode } from "react";
import classnames from "classnames";

type TabType = {
  id: string | number;
  icon?: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
};

function Tab({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      disabled={active}
      className={classnames(
        "whitespace-nowrap rounded-lg p-2 text-center text-sm font-medium bg-stone-50 dark:bg-stone-800",
        {
          "text-emerald-500": active,
          "dark:text-stone-400 text-stone-700 hover:bg-stone-200 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-300":
            !active,
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
          <Tab active={tab.isActive}>
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
