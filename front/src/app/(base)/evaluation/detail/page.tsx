"use client";

import { useRouter } from "next/navigation";
import { useCallback, useContext } from "react";
import toast from "react-hot-toast";

import * as evaluation_sets from "@/app/components/evaluation_sets";

import * as layouts from "@/lib/components/layouts";
import * as ui from "@/lib/components/ui";

import EvaluationSetContext from "./context";

export default function Page() {
  const router = useRouter();
  const evaluationSet = useContext(EvaluationSetContext);

  const handleDelete = useCallback(() => {
    router.push("/evaluation/");
  }, [router]);

  return (
    <layouts.Detail
      Actions={
        <evaluation_sets.Actions
          evaluationSet={evaluationSet}
          onDelete={handleDelete}
        />
      }
      SideBar={
        <evaluation_sets.Update
          evaluationSet={evaluationSet}
          onChange={() => toast.success("Evaluation Set updated successfully.")}
        />
      }
      MainContent={
        <div className="flex flex-col gap-4 grow">
          <evaluation_sets.Overview evaluationSet={evaluationSet} />
          <div className="grid grid-cols-2 gap-4">
            <ui.Card>
              <evaluation_sets.ModelEvaluationSummary
                evaluationSet={evaluationSet}
              />
            </ui.Card>
            <ui.Card>
              <evaluation_sets.UserEvaluationSummary
                evaluationSet={evaluationSet}
              />
            </ui.Card>
          </div>
        </div>
      }
    />
  );
}
