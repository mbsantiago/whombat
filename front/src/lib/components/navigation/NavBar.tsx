import { Menu, Transition } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import classnames from "classnames";
import { Fragment } from "react";
import useActiveUser from "@/app/hooks/api/useActiveUser";

import { HorizontalDivider } from "@/lib/components/layouts/Divider";

import type { User } from "@/lib/types";

function Brand() {
  return (
    <a href="/" className="flex items-center">
      <span className="self-center whitespace-nowrap text-2xl font-bold text-emerald-500 underline decoration-4">
        Whombat
      </span>
    </a>
  );
}

function UserDetail({ user }: { user?: User }) {
  return (
    <div className="m-2 flex flex-row justify-center rounded bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">
      <UserIcon className="h-6 w-6" />
      <span className="ml-2 text-sm">{user?.username}</span>
    </div>
  );
}

function UserMenu({ user, onLogout }: { user?: User; onLogout?: () => void }) {
  const {
    logout: { mutate: logout },
  } = useActiveUser({ user, onLogout });

  return (
    <Menu as="div" className="relative z-10 inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center rounded-md">
        User
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-to-right absolute right-0 z-50 mt-2 w-44 space-y-1 rounded-md bg-stone-200 p-1 shadow-lg dark:bg-stone-700">
          <Menu.Item>
            <UserDetail user={user} />
          </Menu.Item>
          <HorizontalDivider />
          <Menu.Item>
            {({ active }) => (
              <a
                href={"profile"}
                className={classnames(
                  active
                    ? "bg-stone-300 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
                  "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                )}
              >
                Profile
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => logout()}
                className={classnames(
                  active
                    ? "bg-stone-300 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
                  "group flex w-full items-center rounded-md px-2 py-2 text-sm",
                )}
              >
                Logout
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        className="block rounded py-2 pl-3 pr-4 md:bg-transparent md:p-0"
        aria-current="page"
      >
        {label}
      </a>
    </li>
  );
}

function Navigation() {
  const navItems = [
    { href: "/guide/", label: "User Guide" },
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
  ];
  return (
    <div className="hidden w-full md:block md:w-auto" id="navbar-default">
      <ul className="mt-4 flex flex-col rounded-lg border p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:p-0">
        {navItems.map((link) => (
          <NavItem key={link.href} href={link.href} label={link.label} />
        ))}
      </ul>
    </div>
  );
}

export function NavBar({
  user,
  onLogout,
}: {
  user: User;
  onLogout?: () => void;
}) {
  return (
    <nav>
      <div className="z-50 flex max-w-screen-xl flex-wrap items-center justify-between p-4">
        <Brand />
        <Navigation />
        <UserMenu user={user} onLogout={onLogout} />
      </div>
    </nav>
  );
}
