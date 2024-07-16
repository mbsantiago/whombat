import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

import useRecordingHook from "@/app/hooks/useRecording";

export default function useRecording() {
  const router = useRouter();

  const datasetUUID = searchParams.get("dataset_uuid");

  const back = useCallback(() => {
    if (datasetUUID == null) router.push("/datasets/");
    router.push(`/datasets/detail/recordings/?dataset_uuid=${datasetUUID}`);
  }, [router, datasetUUID]);

  const handleError = useCallback(
    (error: AxiosError) => {
      if (error.response?.status === 404) {
        toast.error("Recording not found");
        back();
      }
    },
    [back],
  );

  const onDelete = useCallback(() => {
    toast.success("Recording deleted");
    back();
  }, [back]);

  const recording = useRecordingHook({
    uuid: recordingUUID ?? undefined,
    onError: handleError,
  });

  return { recording, onDelete, uuid: recordingUUID };
}
