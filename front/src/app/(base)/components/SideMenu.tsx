import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  WhombatIcon,
  DatasetsIcon,
  AnnotationProjectIcon,
  ExplorationIcon,
  EvaluationIcon,
  HomeIcon,
  MessagesIcon,
  SettingsIcon,
  LogOutIcon,
} from "@/components/icons";
import classnames from "classnames";
import { HorizontalDivider } from "@/components/Divider";
import Tooltip from "@/components/Tooltip";

function SideMenuButton({
  children,
  tooltip,
  isActive,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
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
      <Link href={href ?? ""}>
        <button
          className={classnames(
            {
              "bg-stone-200 outline outline-2 outline-offset-2 outline-emerald-500 dark:bg-stone-900":
                isActive,
            },
            "group max-w-fit rounded p-2 hover:bg-stone-200 hover:text-stone-700 hover:dark:bg-stone-900 hover:dark:text-stone-300",
          )}
          {...props}
        >
          {children}
        </button>
      </Link>
    </Tooltip>
  );
}

function MainNavigation({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <li className="px-3">
        <SideMenuButton
          isActive={pathname === "/datasets"}
          tooltip={"Datasets"}
          href="/datasets"
        >
          <DatasetsIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname === "/annotation_projects"}
          tooltip={"Annotation Projects"}
          href="/annotation_projects"
        >
          <AnnotationProjectIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname === "/exploration"}
          tooltip={"Exploration"}
        >
          <ExplorationIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton
          isActive={pathname === "/evaluation"}
          tooltip={"Evaluation"}
        >
          <EvaluationIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
    </ul>
  );
}

function SecondaryNavigation({ pathname }: { pathname?: string }) {
  return (
    <ul className="flex flex-col space-y-3 py-4 text-stone-400">
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuButton isActive={pathname === "/"} tooltip={"Home"} href="/">
          <HomeIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton tooltip={"Messages"}>
          <MessagesIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <li className="px-3">
        <SideMenuButton tooltip={"Settings"}>
          <SettingsIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
      <HorizontalDivider />
      <li className="px-3">
        <SideMenuButton tooltip={"Log Out"}>
          <LogOutIcon className="w-6 h-6" />
        </SideMenuButton>
      </li>
    </ul>
  );
}

function SideMenu() {
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
        <SecondaryNavigation pathname={pathname} />
      </div>
    </aside>
  );
}

export { SideMenu };
