import classnames from "classnames";
import Link from "next/link";
import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from "react";

type TabType = {
  id: string | number;
  title: string;
  isActive: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  href?: string;
  render?: () => React.ReactNode;
};

const BASE_CLASS =
  "whitespace-nowrap rounded-lg bg-stone-50 p-2 text-center text-sm font-medium dark:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/50";

const ACTIVE_CLASS = "text-emerald-500";

const INACTIVE_CLASS =
  "text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300";

function TabButton({
  children,
  active = false,
  className,
  ...props
}: {
  children: ReactNode;
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={classnames(
        BASE_CLASS,
        active ? ACTIVE_CLASS : INACTIVE_CLASS,
        className,
      )}
    >
      {children}
    </button>
  );
}

function TabLink({
  children,
  active = false,
  className,
  ...props
}: { children: ReactNode; active: boolean } & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={classnames(
        BASE_CLASS,
        active ? ACTIVE_CLASS : INACTIVE_CLASS,
        className,
        "p-2 inline-block",
      )}
    >
      {children}
    </Link>
  );
}

export default function Tabs({ tabs }: { tabs: TabType[] }) {
  return (
    <ul className="flex space-x-4">
      {tabs.map((tab) => (
        <li key={tab.id}>
          {tab.href != null ? (
            <TabLink href={tab.href} active={tab.isActive}>
              {tab.icon ? (
                <span className="mr-1 inline-block align-middle">
                  {tab.icon}
                </span>
              ) : null}
              {tab.title}
            </TabLink>
          ) : (
            <TabButton onClick={tab.onClick} active={tab.isActive}>
              {tab.icon ? (
                <span className="mr-1 inline-block align-middle">
                  {tab.icon}
                </span>
              ) : null}
              {tab.title}
            </TabButton>
          )}
        </li>
      ))}
    </ul>
  );
}
