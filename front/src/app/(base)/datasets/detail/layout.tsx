"use client";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";
import * as icons from "@/components/icons";
import Loading from "@/app/loading";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import useDataset from "@/hooks/useDataset";
import { H1 } from "@/components/Headings";

function DatasetHeader({ name }: { name: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const selectedLayoutSegment = useSelectedLayoutSegment();

  return (
    <Header>
      <div className="flex w-full flex-row space-x-4 overflow-x-scroll">
        <H1>{name}</H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: selectedLayoutSegment === null,
              icon: <icons.DatasetIcon className="h-4 w-4 align-middle" />,
              onClick: () => {
                router.push(`/datasets/detail/?${params.toString()}`);
              },
            },
            {
              id: "recordings",
              title: "Recordings",
              icon: <icons.RecordingsIcon className="h-4 w-4 align-middle" />,
              isActive: selectedLayoutSegment === "recordings",
              onClick: () => {
                router.push(
                  `/datasets/detail/recordings/?${params.toString()}`,
                );
              },
            },
            {
              id: "sound_events",
              title: "Sound Events",
              icon: <icons.SoundEventIcon className="h-4 w-4 align-middle" />,
              isActive: selectedLayoutSegment === "sound_events",
              onClick: () => {
                router.push(
                  `/datasets/detail/sound_events/?${params.toString()}`,
                );
              },
            },
            {
              id: "notes",
              icon: <icons.NotesIcon className="h-4 w-4 align-middle" />,
              title: "Notes",
              isActive: selectedLayoutSegment === "notes",
              onClick: () => {
                router.push(`/datasets/detail/notes/?${params.toString()}`);
              },
            },
          ]}
        />
      </div>
    </Header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useDataset();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    notFound();
  }

  return (
    <>
      <DatasetHeader name={data.name} />
      <div className="p-4">{children}</div>
    </>
  );
}
