"use client";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";
import { toast } from "react-hot-toast";

import { type EvaluationSetUpdate } from "@/api/evaluation_sets";
import { type Tag } from "@/api/schemas";
import { EvaluationSetContext } from "@/app/contexts";
import Loading from "@/app/loading";
import EvaluationSetHeader from "@/components/evaluation_sets/EvaluationSetHeader";
import useEvaluationSet from "@/hooks/api/useEvaluationSet";

export default function Layout({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();

  const evaluation_set_id = parseInt(params.get("evaluation_set_id") ?? "");

  // Fetch the annotation project.
  const evaluationSet = useEvaluationSet({
    evaluation_set_id,
    enabled: !Number.isNaN(evaluation_set_id),
  });

  const { mutateAsync: updateEvaluationSet } = evaluationSet.update;
  const onUpdate = useCallback(
    async (data: EvaluationSetUpdate) => {
      return await toast.promise(updateEvaluationSet(data), {
        loading: "Updating evaluation set...",
        success: "Evaluation set updated.",
        error: "Error updating evaluation set.",
      });
    },
    [updateEvaluationSet],
  );

  const { mutateAsync: deleteEvaluationSet } = evaluationSet.delete;
  const onDelete = useCallback(async () => {
    const deleted = await toast.promise(deleteEvaluationSet(), {
      loading: "Deleting evaluation set...",
      success: "Evaluation set deleted.",
      error: "Error deleting evaluation set.",
    });
    router.push("/evaluation/");
    return deleted;
  }, [deleteEvaluationSet, router]);

  const { mutateAsync: addTagToEvaluationSet } = evaluationSet.addTag;
  const onAddTag = useCallback(
    async (tag: Tag) => {
      return await toast.promise(addTagToEvaluationSet(tag.id), {
        loading: "Adding tag to evaluation set...",
        success: "Tag added to evaluation set.",
        error: "Error adding tag to evaluation set.",
      });
    },
    [addTagToEvaluationSet],
  );

  const { mutateAsync: removeTagFromEvaluationSet } = evaluationSet.removeTag;
  const onRemoveTag = useCallback(
    async (tag: Tag) => {
      return await toast.promise(removeTagFromEvaluationSet(tag.id), {
        loading: "Removing tag from evaluation set...",
        success: "Tag removed from evaluation set.",
        error: "Error removing tag from evaluation set.",
      });
    },
    [removeTagFromEvaluationSet],
  );

  if (Number.isNaN(evaluation_set_id)) {
    return notFound();
  }

  if (evaluationSet.query.isError) {
    // If not found, go to the annotation projects page.
    toast.error("Evaluation set not found.");
    router.push("/evaluation/");
    return;
  }

  if (evaluationSet.query.isLoading) {
    if (evaluationSet.query.failureCount === 2) {
      toast.error("Error loading evaluation set.");
    }
    return <Loading />;
  }

  return (
    <EvaluationSetContext.Provider
      value={{
        evaluationSet: evaluationSet.query.data,
        update: onUpdate,
        delete: onDelete,
        addTag: onAddTag,
        removeTag: onRemoveTag,
      }}
    >
      <EvaluationSetHeader evaluationSet={evaluationSet.query.data} />
      <div className="p-4">{children}</div>
    </EvaluationSetContext.Provider>
  );
}
