import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import useStore from "@/app/store";

import StatusBadge from "@/lib/components/annotation_tasks/StatusBadge";
import { SunIcon } from "@/lib/components/icons";
import TableCell from "@/lib/components/tables/TableCell";
import TableHeader from "@/lib/components/tables/TableHeader";
import TagComponent from "@/lib/components/tags/Tag";

import type {
  AnnotationStatusBadge,
  AnnotationTask,
  Note,
  Recording,
  Tag,
} from "@/lib/types";

const defaultPathFormatter = (path: string) => path;

export default function useAnnotationTaskTable({
  data,
  pathFormatter = defaultPathFormatter,
  getAnnotationTaskLink,
}: {
  data: AnnotationTask[];
  pathFormatter?: (path: string) => string;
  getAnnotationTaskLink?: (annotationTask: AnnotationTask) => string;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  // Column definitions
  const columns = useMemo<ColumnDef<AnnotationTask>[]>(
    () => [
      {
        id: "recording",
        header: () => <TableHeader>Recording</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.clip?.recording,
        cell: ({ row }) => {
          const recording = row.getValue("recording") as Recording;
          return (
            <TableCell>
              <Link
                className="hover:font-bold hover:text-emerald-500 focus:ring focus:ring-emerald-500 focus:outline-none"
                href={
                  `/annotation_projects/` +
                    getAnnotationTaskLink?.(row.original) || "#"
                }
              >
                {pathFormatter(recording.path)}
              </Link>
            </TableCell>
          );
        },
      },
      {
        id: "rec_notes",
        header: () => <TableHeader>Notes</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.clip?.recording.notes,
        cell: ({ row }) => {
          const rec_notes = row.getValue("rec_notes") as Note[];
          if ((rec_notes || []).length == 0) return null;

          return (
            <span className="ms-2">
              <SunIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              {rec_notes.length} notes
            </span>
          );
        },
      },
      {
        id: "start",
        header: () => <TableHeader>Start</TableHeader>,
        enableResizing: true,
        size: 20,
        accessorFn: (row) => row.clip?.start_time,
        cell: ({ row }) => {
          const start = row.getValue("start") as string;
          return <TableCell>{start}</TableCell>;
        },
      },
      {
        id: "end",
        header: () => <TableHeader>End</TableHeader>,
        enableResizing: true,
        size: 20,
        accessorFn: (row) => row.clip?.end_time,
        cell: ({ row }) => {
          const end = row.getValue("end") as string;
          return <TableCell>{end}</TableCell>;
        },
      },
      {
        id: "tags",
        header: () => <TableHeader>Tags</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.clip_annotation?.tags,
        cell: ({ row }) => {
          const tags = row.getValue("tags") as Tag[];
          return (
            <TableCell>
              <div className="flex flex-row flex-wrap gap-1">
                {tags.map((tag) => (
                  <TagComponent
                    key={`${tag.key}-${tag.value}`}
                    tag={tag}
                    {...getTagColor(tag)}
                    onClick={undefined}
                    onClose={undefined}
                  />
                ))}
              </div>
            </TableCell>
          );
        },
      },
      {
        id: "clip_anno_notes",
        header: () => <TableHeader>Annotation Notes</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.clip_annotation?.notes,
        cell: ({ row }) => {
          const clip_anno_notes = row.getValue("clip_anno_notes") as Note[];
          if ((clip_anno_notes || []).length == 0) return null;

          return (
            <span className="ms-2">
              <SunIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              {clip_anno_notes.length} notes
            </span>
          );
        },
      },
      {
        id: "status",
        header: () => <TableHeader>Status</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.status_badges,
        cell: ({ row }) => {
          const status = row.getValue("status") as AnnotationStatusBadge[];
          return (
            <TableCell>
              <div className="flex flex-row flex-wrap gap-1">
                {status?.map((badge) => (
                  <StatusBadge
                    key={`${badge.state}-${badge.user?.id}`}
                    badge={badge}
                  />
                ))}
              </div>
            </TableCell>
          );
        },
      },
    ],
    [getAnnotationTaskLink, getTagColor, pathFormatter],
  );
  return useReactTable<AnnotationTask>({
    data,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });
}
