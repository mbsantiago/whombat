"use client";
import toast from "react-hot-toast";
import {
  notFound,
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";
import { type ReactNode } from "react";

import useDataset from "@/hooks/api/useDataset";
import * as icons from "@/components/icons";
import Loading from "@/app/loading";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import { H1 } from "@/components/Headings";

import { DatasetContext } from "./context";


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
  // Get the dataset_id from the URL
  const params = useSearchParams();
  const dataset_id = params.get("dataset_id");

  // Fetch the dataset from the API
  const router = useRouter();
  const dataset = useDataset({
    dataset_id: dataset_id == null ? undefined : parseInt(dataset_id),
    onDelete: () => {
      toast.success("Dataset deleted");
      router.push("/datasets/");
    },
  });

  // If no dataset_id is provided, show a 404 page
  if (!dataset_id) notFound();

  // If the dataset is loading or not yet fetched, show a loading indicator
  if (dataset.query.isLoading || dataset.query.data == null) {
    return <Loading />;
  }

  // If the dataset is not found, show a 404 page
  if (dataset.query.isError) {
    return notFound();
  }

  return (
    <DatasetContext.Provider
      value={{
        dataset: dataset.query.data,
        isLoading: dataset.query.isLoading,
        onChange: dataset.update.mutate,
        onDelete: dataset.delete.mutate,
        downloadLink: dataset.downloadLink,
      }}
    >
      <DatasetHeader name={dataset.query.data.name} />
      <div className="p-4">{children}</div>
    </DatasetContext.Provider>
  );
}
