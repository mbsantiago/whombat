"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import toast from "react-hot-toast";

import api from "@/app/api";
import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";
import AnnotationTaskFilters from "@/lib/components/annotation_tasks/AnnotationTaskFilters";
import StatusBadge from "@/lib/components/annotation_tasks/StatusBadge";
import Pagination from "@/lib/components/lists/Pagination";
import * as ui from "@/lib/components/ui";
import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectTaskList({
  annotationProject,
}: {
  annotationProject: AnnotationProject;
}) {
  const searchParams = useSearchParams();
  const status = ["pending", "rejected", "completed", "verified"].find(
    (key) => searchParams.get(key) === "true",
  );
  // Stable identity: useFilter resets its state whenever `defaults` changes
  // reference, which would re-render forever.
  const filter = useMemo(
    () => ({
      annotation_project: annotationProject,
      ...(status ? { [status]: true } : {}),
    }),
    [annotationProject, status],
  );
  const tasks = useAnnotationTasks({
    filter,
    fixed: ["annotation_project"],
  });
  const queryClient = useQueryClient();

  if (tasks.isLoading || tasks.data == null) return <ui.Loading />;

  return (
    <ui.Card>
      <ui.H3>Existing Tasks</ui.H3>
      <div className="flex flex-col gap-4">
        <AnnotationTaskFilters filter={tasks.filter} total={tasks.total} />
        {tasks.items.length === 0 ? (
          <ui.Empty>No annotation tasks found.</ui.Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800">
                  <th className="px-3 py-2">UUID</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Dataset</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.items.map((task) => (
                  <tr
                    key={task.uuid}
                    className="border-t border-stone-200 dark:border-stone-700"
                  >
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
                      {task.uuid}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {task.created_on.toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {task.dataset_name ?? "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {task.status_badges?.length ? (
                        task.status_badges.map((badge, i) => (
                          <StatusBadge
                            key={`${badge.state}-${i}`}
                            badge={badge}
                          />
                        ))
                      ) : (
                        <span>Pending</span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <ui.Dialog
                        label="Delete"
                        title="Delete annotation task?"
                        variant="danger"
                      >
                        {({ close }) => (
                          <div className="flex flex-col gap-4">
                            <p className="rounded-md border border-amber-400 p-3 text-amber-700">
                              This also deletes the clip annotation associated
                              with this task.
                            </p>
                            <div className="flex justify-end gap-2">
                              <ui.Button variant="secondary" onClick={close}>
                                Cancel
                              </ui.Button>
                              <ui.Button
                                variant="danger"
                                onClick={async () => {
                                  try {
                                    await api.annotationTasks.delete(task);
                                    await queryClient.invalidateQueries({
                                      queryKey: ["annotation_tasks"],
                                    });
                                    toast.success("Task deleted");
                                    close();
                                  } catch {
                                    toast.error("Could not delete task");
                                  }
                                }}
                              >
                                Delete
                              </ui.Button>
                            </div>
                          </div>
                        )}
                      </ui.Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination {...tasks.pagination} />
      </div>
    </ui.Card>
  );
}
