"use client";
import toast from "react-hot-toast";
import { useCallback } from "react";
import { useSearchParams, notFound, useRouter } from "next/navigation";

import EvaluationSetTags from "@/components/evaluation_sets/EvaluationSetTags";
import useEvaluationSet from "@/hooks/api/useEvaluationSet";
import Loading from "@/app/loading";
import Link from "@/components/Link";
import Button from "@/components/Button";
import { type Tag } from "@/api/tags";
import { CloseIcon, BackIcon, NextIcon } from "@/components/icons";
import { type EvaluationSet } from "@/api/evaluation_sets";

function NavBar({
  evaluationSet,
  onCancel,
  onBack,
}: {
  evaluationSet: EvaluationSet;
  onCancel: () => void;
  onBack: () => void;
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
        <Button variant="warning" mode="text" onClick={onBack}>
          <BackIcon className="inline-block w-4 h-4 mr-1" /> Back
        </Button>
        <Link
          mode="text"
          href={`/evaluation/create/tasks/?evaluation_set_id=${evaluationSet.id}`}
        >
          Next
          <NextIcon className="inline-block w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const evaluation_set_id = searchParams.get("evaluation_set_id");

  const evaluationSet = useEvaluationSet({
    evaluation_set_id: evaluation_set_id ? parseInt(evaluation_set_id) : -1,
    enabled: evaluation_set_id != null,
  });

  const { mutateAsync: delete_ } = evaluationSet.delete;
  const onBack = useCallback(async () => {
    if (evaluationSet.query.data != null && delete_ != null) {
      await toast.promise(delete_(), {
        loading: "Deleting Evaluation Set...",
        success: "Creation reset!",
        error: "Something went wrong. Please try again.",
      });
    }
    router.push("/evaluation/create/");
  }, [evaluationSet.query.data, delete_, router]);

  const onCancel = useCallback(async () => {
    if (evaluationSet.query.data != null && delete_ != null) {
      await toast.promise(delete_(), {
        loading: "Deleting Evaluation Set...",
        success: "Creation reset!",
        error: "Something went wrong. Please try again.",
      });
    }
    router.push("/evaluation/");
  }, [evaluationSet.query.data, delete_, router]);

  const { mutateAsync: addTag } = evaluationSet.addTag;
  const onAddTag = useCallback(
    async (tag: Tag) => {
      await toast.promise(addTag(tag.id), {
        loading: "Adding tag...",
        success: "Tag added!",
        error: "Something went wrong. Please try again.",
      });
    },
    [addTag],
  );

  const { mutateAsync: removeTag } = evaluationSet.removeTag;
  const onRemoveTag = useCallback(
    async (tag: Tag) => {
      await toast.promise(removeTag(tag.id), {
        loading: "Removing tag...",
        success: "Tag removed!",
        error: "Something went wrong. Please try again.",
      });
    },
    [removeTag],
  );

  if (evaluation_set_id == null) {
    return notFound();
  }

  if (evaluationSet.query.isLoading || evaluationSet.query.data == null) {
    return <Loading />;
  }

  return (
    <>
      <NavBar
        evaluationSet={evaluationSet.query.data}
        onBack={onBack}
        onCancel={onCancel}
      />
      <EvaluationSetTags
        evaluationSet={evaluationSet.query.data}
        onAddTag={onAddTag}
        onRemoveTag={onRemoveTag}
      />
    </>
  );
}
