"use client";
import { useContext } from "react";
import { notFound } from "next/navigation";
import { type Dataset } from "@/api/datasets";
import useDataset from "@/hooks/useDataset";
import Loading from "@/app/loading";
import { Input, TextArea } from "@/components/inputs";
import {
  EditableDescriptionData,
  DescriptionData,
  DescriptionTerm,
} from "@/components/Description";

import { DatasetContext } from "./context";

function DatasetDetail({
  dataset,
}: {
  dataset: ReturnType<typeof useDataset>;
}) {
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-stone-900 dark:text-stone-200">
          Dataset Information
        </h3>
      </div>
      <div className="mt-6 border-t border-stone-300 dark:border-stone-700">
        <dl className="divide-y divide-stone-500">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Name</DescriptionTerm>
            <EditableDescriptionData
              value={dataset.query.data?.name}
              onChange={(value) => {
                dataset.update.mutate({ name: value });
              }}
              Input={Input}
              autoFocus
            >
              {dataset.query.data?.name}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Description</DescriptionTerm>
            <EditableDescriptionData
              value={dataset.query.data?.description}
              onChange={(value) => {
                dataset.update.mutate({ description: value });
              }}
              Input={TextArea}
              autoFocus
            >
              {dataset.query.data?.description}
            </EditableDescriptionData>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <DescriptionTerm>Created On</DescriptionTerm>
            <DescriptionData>
              {dataset.query.data?.created_at.toLocaleString()}
            </DescriptionData>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Bullet({ value, label }: { value: string; label: string }) {
  return (
    <div className="mx-auto flex max-w-xs flex-col gap-y-2">
      <dt className="text-base leading-7 text-stone-600 dark:text-stone-400">
        {label}
      </dt>
      <dd className="order-first text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
        {value}
      </dd>
    </div>
  );
}

function DatasetBullets({ dataset }: { dataset: Dataset }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-800 py-8 sm:py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          <Bullet value={dataset.recording_count.toLocaleString()} label="Recordings in dataset" />
          <Bullet value="29" label="Registered Sound Events" />
          <Bullet value="3" label="Notes" />
        </dl>
      </div>
    </div>
  );
}

export default function DatasetHome() {
  const dataset = useContext(DatasetContext);

  if (dataset == null) return notFound();
  if (dataset.query.data == null) return <Loading />;

  return (
    <div className="container grid grid-cols-2 gap-4">
      <div>
        <DatasetDetail dataset={dataset} />
      </div>
      <div className="flex flex-col gap-2">
      </div>
    </div>
  );
}
