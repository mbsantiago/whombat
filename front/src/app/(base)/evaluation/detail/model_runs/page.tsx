"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useMemo } from "react";

import Pagination from "@/app/components/Pagination";
import ModelRunImport from "@/app/components/model_runs/ModelRunImport";

import useModelRuns from "@/app/hooks/api/useModelRuns";

import {
  AddIcon,
  ModelIcon,
  UploadIcon,
  WarningIcon,
} from "@/lib/components/icons";
import Search from "@/lib/components/inputs/Search";
import ListLayout from "@/lib/components/layouts/List";
import ModelRun from "@/lib/components/model_runs/ModelRun";
import { Dialog, Empty } from "@/lib/components/ui";

import type * as types from "@/lib/types";

import EvaluationSetContext from "../context";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const evaluationSet = useContext(EvaluationSetContext);

  const initialFilter: types.ModelRunFilter = useMemo(
    () => ({
      evaluation_set: evaluationSet,
    }),
    [evaluationSet],
  );

  const { items, isLoading, filter, pagination } = useModelRuns({
    filter: initialFilter,
    fixed: ["evaluation_set"],
  });

  const isImport = params.get("import") === "true";

  const handleCreate = useCallback(
    (data: types.ModelRun) => {
      router.push(
        `/evaluation/detail/model_run/?model_run_uuid=${data.uuid}&evaluation_set_uuid=${evaluationSet.uuid}`,
      );
    },
    [router, evaluationSet.uuid],
  );

  const handleClickModelRun = useCallback(
    (modelRun: types.ModelRun) => {
      router.push(
        `/evaluation/detail/model_run/?model_run_uuid=${modelRun.uuid}&evaluation_set_uuid=${evaluationSet.uuid}`,
      );
    },
    [router, evaluationSet.uuid],
  );

  return (
    <ListLayout
      isLoading={isLoading}
      items={items.map((modelRun) => (
        <ModelRun
          key={modelRun.uuid}
          modelRun={modelRun}
          onClick={() => handleClickModelRun(modelRun)}
        />
      ))}
      isEmpty={items.length === 0}
      Search={
        <Search
          label="Search"
          placeholder="Search dataset..."
          value={filter.get("search")}
          onChange={(value) => filter.set("search", value as string)}
          onSubmit={() => filter.submit()}
          icon={<ModelIcon />}
        />
      }
      Actions={[
        <Dialog
          key="import"
          mode="text"
          title="Import a Model Run"
          open={isImport}
          label={
            <>
              <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
              Import
            </>
          }
        >
          {() => (
            <ModelRunImport
              evaluationSet={evaluationSet}
              onCreate={handleCreate}
            />
          )}
        </Dialog>,
      ]}
      Pagination={<Pagination pagination={pagination} />}
      Empty={<NoModelRuns />}
    />
  );
}

function NoModelRuns() {
  return (
    <Empty>
      <WarningIcon className="w-8 h-8 text-stone-500" />
      <p>No model runs found.</p>
      <p>
        To create a model run click on the{" "}
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Import{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}
