import {
  type ButtonHTMLAttributes,
  type ReactNode,
  type ComponentProps,
} from "react";
import Link from "next/link";
import classnames from "classnames";

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

const DISABLED_CLASS = "text-emerald-500";

const ENABLED_CLASS =
  "text-stone-700 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-300";

function TabButton({
  children,
  disabled,
  className,
  ...props
}: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={classnames(
        BASE_CLASS,
        disabled ? DISABLED_CLASS : ENABLED_CLASS,
        className,
      )}
    >
      {children}
    </button>
  );
}

function TabLink({
  children,
  disabled,
  className,
  ...props
}: { children: ReactNode; disabled: boolean } & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={classnames(
        BASE_CLASS,
        disabled ? DISABLED_CLASS : ENABLED_CLASS,
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
            <TabLink href={tab.href} disabled={tab.isActive}>
              {tab.icon ? (
                <span className="mr-1 inline-block align-middle">
                  {tab.icon}
                </span>
              ) : null}
              {tab.title}
            </TabLink>
          ) : (
            <TabButton onClick={tab.onClick} disabled={tab.isActive}>
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
