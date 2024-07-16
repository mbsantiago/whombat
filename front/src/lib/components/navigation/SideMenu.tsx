import classnames from "classnames";
import { usePathname } from "next/navigation";

import { HorizontalDivider } from "@/lib/components/layouts/Divider";
import {
  AnnotationProjectIcon,
  DatasetsIcon,
  EvaluationIcon,
  ExplorationIcon,
  HomeIcon,
  LogOutIcon,
  PluginIcon,
  SettingsIcon,
  WhombatIcon,
} from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Link from "@/lib/components/ui/Link";
import Tooltip from "@/lib/components/ui/Tooltip";
import useActiveUser from "@/app/hooks/api/useActiveUser";

import type { User } from "@/lib/types";
import type { ComponentProps } from "react";

function SideMenuLink({
  children,
  tooltip,
  isActive,
  href,
  ...props
}: ComponentProps<typeof Link> & {
  tooltip?: string;
  isActive?: boolean;
  href?: string;
}) {
  return (
    <Tooltip
      tooltip={
        <p className="whitespace-nowrap text-stone-700 dark:text-stone-300">
          {tooltip}
        </p>
      }
    >
      <Link
        href={href ?? ""}
        mode="text"
        variant={isActive ? "primary" : "secondary"}
        className={classnames(
          isActive
            ? "bg-stone-200 dark:bg-stone-900"
            : "hover:bg-stone-200 hover:text-stone-700 hover:dark:bg-stone-900 hover:dark:text-stone-300",
        )}
        {...props}
      >
        {children}
      </Link>
    </Tooltip>
  );
}

function SideMenuButton({
  children,
  tooltip,
  isActive,
  ...props
}: ComponentProps<typeof Button> & {
  tooltip?: string;
  isActive?: boolean;
}) {
  return (
    <Tooltip
      tooltip={
        <p className="whitespace-nowrap text-stone-700 dark:text-stone-300">
          {tooltip}
        </p>
      }
    >
      <Button
        mode="text"
        variant={isActive ? "primary" : "secondary"}
        className={classnames(
          isActive
            ? "bg-stone-200 dark:bg-stone-900"
            : "hover:bg-stone-200 hover:text-stone-700 hover:dark:bg-stone-900 hover:dark:text-stone-300",
        )}
        {...props}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function MainNavigation({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <li className="px-3">
        <SideMenuLink
          isActive={pathname?.startsWith("/datasets")}
          tooltip={"Datasets"}
          href="/datasets"
        >
          <DatasetsIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <li className="px-3">
        <SideMenuLink
          isActive={pathname?.startsWith("/annotation_projects")}
          tooltip={"Annotation Projects"}
          href="/annotation_projects"
        >
          <AnnotationProjectIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <li className="px-3">
        <SideMenuLink
          isActive={pathname?.startsWith("/evaluation")}
          tooltip={"Evaluation"}
          href="/evaluation"
        >
          <EvaluationIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <li className="px-3">
        <SideMenuLink
          isActive={pathname?.startsWith("/exploration")}
          tooltip={"Exploration"}
          href="/exploration"
        >
          <ExplorationIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
    </ul>
  );
}

function SecondaryNavigation({
  user,
  pathname,
  onLogout,
}: {
  user: User;
  pathname?: string;
  onLogout?: () => void;
}) {
  const {
    logout: { mutate: logout },
  } = useActiveUser({ user, onLogout });

  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuLink isActive={pathname === "/"} tooltip={"Home"} href="/">
          <HomeIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <li className="px-3">
        <SideMenuLink href="/plugins" tooltip={"Plugins"}>
          <PluginIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <li className="px-3">
        <SideMenuLink href="/" tooltip={"Settings"}>
          <SettingsIcon className="w-6 h-6" />
        </SideMenuLink>
      </li>
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuButton tooltip={"Log Out"}>
          <LogOutIcon onClick={() => logout()} className="w-6 h-6" />
        </SideMenuButton>
      </li>
    </ul>
  );
}

export function SideMenu({
  onLogout,
  user,
}: {
  onLogout?: () => void;
  user: User;
}) {
  const pathname = usePathname();
  return (
    <aside
      id="side-menu"
      className="sticky left-0 top-0 z-40 flex h-screen w-16 flex-shrink-0 flex-col shadow-md"
      aria-label="Sidebar"
    >
      <div className="flex flex-grow flex-col justify-between overflow-y-auto overflow-x-hidden bg-stone-50 dark:bg-stone-800">
        <div className="flex flex-col items-center">
          <div className="px-2 py-4">
            <WhombatIcon width={46} height={46} />
          </div>
          <MainNavigation pathname={pathname} />
        </div>
        <SecondaryNavigation
          pathname={pathname}
          user={user}
          onLogout={onLogout}
        />
      </div>
    </aside>
  );
}
