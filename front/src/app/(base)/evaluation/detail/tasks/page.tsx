"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetExamples from "@/lib/components/evaluation_sets/EvaluationSetExamples";
import Center from "@/lib/components/layouts/Center";

import EvaluationSetContext from "../context";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleOnAddTask = useCallback(() => {
    toast.success("Evaluation examples added!");
    router.push(
      `/evaluation/detail/?evaluation_set_uuid=${evaluationSet.uuid}`,
    );
  }, [evaluationSet.uuid, router]);

  return (
    <Center>
      <EvaluationSetExamples
        evaluationSet={evaluationSet}
        onAddTasks={handleOnAddTask}
      />
    </Center>
  );
}
