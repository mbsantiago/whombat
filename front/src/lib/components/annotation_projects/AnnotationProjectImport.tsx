import { useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UploadIcon } from "@/lib/components/icons";
import { Input, InputGroup, Submit } from "@/lib/components/inputs/index";

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
      <InputGroup
        name="annotation_project"
        label="Select a project file to import"
        help="The file must be in AOEF format"
        error={errors.annotation_project?.message}
      >
        <Input type="file" {...register("annotation_project")} required />
      </InputGroup>
      <Submit>
        <UploadIcon className="inline-block mr-2 w-6 h-6 align-middle" />
        Import
      </Submit>
    </form>
  );
}

export const AnnotationProjectImportSchema = z.object({
  annotation_project: z.instanceof(FileList),
});

export type AnnotationProjectImport = z.infer<
  typeof AnnotationProjectImportSchema
>;
