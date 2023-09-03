"use client";
import {
  notFound,
  useSearchParams,
  useSelectedLayoutSegment,
  useRouter,
} from "next/navigation";
import { type ReactNode } from "react";
import * as icons from "@/components/icons";
import Loading from "@/app/loading";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import useDataset from "@/hooks/useDataset";
import { DatasetContext } from "./context";
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
            // {
            //   id: "sound_events",
            //   title: "Sound Events",
            //   icon: <icons.SoundEventIcon className="h-4 w-4 align-middle" />,
            //   isActive: selectedLayoutSegment === "sound_events",
            //   onClick: () => {
            //     router.push(
            //       `/datasets/detail/sound_events/?${params.toString()}`,
            //     );
            //   },
            // },
            // {
            //   id: "notes",
            //   icon: <icons.NotesIcon className="h-4 w-4 align-middle" />,
            //   title: "Notes",
            //   isActive: selectedLayoutSegment === "notes",
            //   onClick: () => {
            //     router.push(`/datasets/detail/notes/?${params.toString()}`);
            //   },
            // },
          ]}
        />
      </div>
    </Header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const dataset_id = params.get("dataset_id");
  if (!dataset_id) notFound();
  const dataset = useDataset({
    dataset_id: parseInt(dataset_id),
  });

  if (dataset.query.isLoading) {
    return <Loading />;
  }

  if (dataset.query.isError) {
    notFound();
  }

  return (
    <DatasetContext.Provider value={dataset}>
      <DatasetHeader name={dataset.query.data.name} />
      <div className="p-4">{children}</div>
    </DatasetContext.Provider>
  );
}
