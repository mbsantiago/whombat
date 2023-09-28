"use client";
import toast from "react-hot-toast";
import { useSearchParams, notFound, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import useEvaluationSet from "@/hooks/api/useEvaluationSet";
import useEvaluationTasks from "@/hooks/api/useEvaluationTasks";
import Loading from "@/app/loading";
import Link from "@/components/Link";
import Button from "@/components/Button";
import EvaluationSetTasks from "@/components/evaluation_sets/EvaluationSetTasks";
import { type EvaluationSet } from "@/api/evaluation_sets";
import { type EvaluationTaskCreate } from "@/api/evaluation_tasks";
import { CloseIcon, BackIcon, CheckIcon } from "@/components/icons";

function NavBar({
  evaluationSet,
  onCancel,
}: {
  evaluationSet: EvaluationSet;
  onCancel: () => void;
}) {
  return (
    <div className="col-span-2 flex flex-row justify-between items-center mb-3">
      <h3 className="text-lg font-bold mb-3">
        Evaluation Set: {evaluationSet.name}
      </h3>
      <div className="inline-flex gap-3">
        <Button variant="danger" mode="text" onClick={onCancel}>
          <CloseIcon className="inline-block w-4 h-4 mr-1" /> Cancel
        </Button>
        <Link
          variant="warning"
          mode="text"
          href={`/evaluation/create/tags/?evaluation_set_id=${evaluationSet.id}`}
        >
          <BackIcon className="inline-block w-4 h-4 mr-1" /> Back
        </Link>
        <Link
          mode="text"
          href={`/evaluation/detail/?evaluation_set_id=${evaluationSet.id}`}
        >
          Done
          <CheckIcon className="inline-block w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  let evaluation_set_id = parseInt(
    searchParams.get("evaluation_set_id") ?? "-1",
    10,
  );

  const evaluationSet = useEvaluationSet({
    evaluation_set_id: evaluation_set_id,
    enabled: evaluation_set_id != -1,
  });

  const { mutateAsync: delete_ } = evaluationSet.delete;
  const onCancel = useCallback(async () => {
    if (delete_ != null) {
      await toast.promise(delete_(), {
        loading: "Deleting Evaluation Set...",
        success: "Creation reset!",
        error: "Something went wrong. Please try again.",
      });
    }
    router.push("/evaluation/");
  }, [delete_, router]);

  const filter = useMemo(
    () => ({ evaluation_set__eq: evaluation_set_id }),
    [evaluation_set_id],
  );
  const evaluationSetTasks = useEvaluationTasks({
    filter,
    pageSize: 0,
    enabled: evaluation_set_id != -1,
  });

  const { mutateAsync: createTasks } = evaluationSetTasks.create;
  const onAddTasks = useCallback(
    async (tasks: EvaluationTaskCreate[]) => {
      return await toast.promise(createTasks(tasks), {
        loading: "Adding tasks. Please wait...",
        success: "Tasks added!",
        error: "Something went wrong. Please try again.",
      });
    },
    [createTasks],
  );

  if (evaluation_set_id == -1 || evaluationSet.query.isError) {
    return notFound();
  }

  if (evaluationSet.query.isLoading || evaluationSet.query.data == null) {
    return <Loading />;
  }

  return (
    <>
      <NavBar evaluationSet={evaluationSet.query.data} onCancel={onCancel} />
      <EvaluationSetTasks
        evaluationSet={evaluationSet.query.data}
        tasks={evaluationSetTasks.total}
        onAddTasks={onAddTasks}
      />
    </>
  );
}
