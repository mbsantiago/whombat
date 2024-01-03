import type { ReactNode } from "react";

export default function DetailLayout({
  children,
  sideBar,
}: {
  children: ReactNode;
  sideBar: ReactNode;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-8 justify-between lg:flex-nowrap w-100">
      <div className="grow">{children}</div>
      <div className="flex flex-col flex-none gap-4 max-w-sm">
        <div className="sticky top-8">{sideBar}</div>
      </div>
    </div>
  );
}
