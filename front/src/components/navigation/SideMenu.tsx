import classnames from "classnames";
import { usePathname } from "next/navigation";
import { type ComponentProps } from "react";

import { HorizontalDivider } from "@/components/Divider";
import {
  AnnotationProjectIcon,
  DatasetsIcon,
  EvaluationIcon,
  ExplorationIcon,
  HomeIcon,
  LogOutIcon,
  MessagesIcon,
  PluginIcon,
  SettingsIcon,
  WhombatIcon,
} from "@/components/icons";
import Link from "@/components/Link";
import Tooltip from "@/components/Tooltip";

function SideMenuButton({
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

function MainNavigation({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <li className="px-3">
        <SideMenuButton
          isActive={pathname?.startsWith("/datasets")}
          tooltip={"Datasets"}
          href="/datasets"
        >
          <DatasetsIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname?.startsWith("/annotation_projects")}
          tooltip={"Annotation Projects"}
          href="/annotation_projects"
        >
          <AnnotationProjectIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname?.startsWith("/evaluation")}
          tooltip={"Evaluation"}
          href="/evaluation"
        >
          <EvaluationIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname?.startsWith("/exploration")}
          tooltip={"Exploration"}
          href="/exploration"
        >
          <ExplorationIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
    </ul>
  );
}

function SecondaryNavigation({
  pathname,
  logout,
}: {
  pathname?: string;
  logout?: () => void;
}) {
  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuButton isActive={pathname === "/"} tooltip={"Home"} href="/">
          <HomeIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton href="/plugins" tooltip={"Plugins"}>
          <PluginIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton href="/" tooltip={"Settings"}>
          <SettingsIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuButton href="/logout" tooltip={"Log Out"}>
          <LogOutIcon onClick={() => logout?.()} className="w-6 h-6" />
        </SideMenuButton>
      </li>
    </ul>
  );
}

export function SideMenu({ logout }: { logout?: () => void }) {
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
        <SecondaryNavigation pathname={pathname} logout={logout} />
      </div>
    </aside>
  );
}
