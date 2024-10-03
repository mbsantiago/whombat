import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { UploadIcon } from "@/lib/components/icons";
import { Group, Input, Submit } from "@/lib/components/inputs/index";

import { AnnotationProjectImportSchema } from "@/lib/schemas";
import type { AnnotationProjectImport } from "@/lib/types";

export default function AnnotationProjectImport({
  onImportAnnotationProject,
}: {
  onImportAnnotationProject?: (data: AnnotationProjectImport) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnotationProjectImport>({
    resolver: zodResolver(AnnotationProjectImportSchema),
    mode: "onChange",
  });

  const onSubmit = useCallback(
    (data: AnnotationProjectImport) => {
      onImportAnnotationProject?.(data);
    },
    [onImportAnnotationProject],
  );

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Group
        name="annotation_project"
        label="Select a project file to import"
        help="The file must be in AOEF format"
        error={errors.annotation_project?.message?.toString()}
      >
        <Input type="file" {...register("annotation_project")} required />
      </Group>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}
