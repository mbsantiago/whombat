"use client";
import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import EvaluationSetTasks from "@/components/evaluation_sets/EvaluationSetTasks";
import Center from "@/components/layouts/Center";

import EvaluationSetContext from "../context";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleOnAddTask = useCallback(() => {
    toast.success("Evaluation tasks added!");
    router.push(
      `/evaluation/detail/?evaluation_set_uuid=${evaluationSet.uuid}`,
    );
  }, [evaluationSet.uuid, router]);

  return (
    <Center>
      <EvaluationSetTasks
        evaluationSet={evaluationSet}
        onAddTasks={handleOnAddTask}
      />
    </Center>
  );
}
