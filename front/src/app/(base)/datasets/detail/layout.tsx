"use client";
import { notFound } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/app/api";
import * as icons from "@/components/icons";
import Loading from "@/app/loading";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import { H1 } from "@/components/Headings";

function DatasetHeader({ name }: { name: string }) {
  return (
    <Header>
      <div className="flex w-full flex-row space-x-16 overflow-x-scroll">
        <H1>{name}</H1>
        <Tabs
          tabs={[
            {
              id: "overview",
              title: "Overview",
              isActive: true,
              icon: <icons.DatasetIcon className="h-4 w-4 align-middle" />,
              onClick: () => {},
            },
            {
              id: "recordings",
              title: "Recordings",
              icon: <icons.RecordingsIcon className="h-4 w-4 align-middle" />,
              isActive: false,
              onClick: () => {},
            },
            {
              id: "sound_events",
              title: "Sound Events",
              icon: <icons.SoundEventIcon className="h-4 w-4 align-middle" />,
              isActive: false,
              onClick: () => {},
            },
            {
              id: "notes",
              icon: <icons.NotesIcon className="h-4 w-4 align-middle" />,
              title: "Notes",
              isActive: false,
              onClick: () => {},
            },
          ]}
        />
      </div>
    </Header>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const uuid = params.get("uuid");

  if (!uuid) {
    notFound();
  }

  const { data, isLoading, isError } = useQuery(["dataset", uuid], () =>
    api.datasets.get(uuid),
  );

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
