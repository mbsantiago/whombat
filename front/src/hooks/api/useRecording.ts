import useObject from "@/hooks/utils/useObject";
import api from "@/app/api";
import { type Recording } from "@/api/schemas";

export default function useRecording({
  uuid,
  recording,
  onUpdate,
  onDelete,
  onAddTag,
  onAddNote,
  onRemoveTag,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  enabled = true,
}: {
  uuid: string;
  recording?: Recording;
  onUpdate?: (recording: Recording) => void;
  onDelete?: (recording: Recording) => void;
  onAddTag?: (recording: Recording) => void;
  onAddNote?: (recording: Recording) => void;
  onRemoveTag?: (recording: Recording) => void;
  onAddFeature?: (recording: Recording) => void;
  onRemoveFeature?: (recording: Recording) => void;
  onUpdateFeature?: (recording: Recording) => void;
  enabled?: boolean;
}) {
  if (recording !== undefined && recording.uuid !== uuid) {
    throw new Error("Recording uuid does not match");
  }

  const { query, useMutation, set } = useObject<Recording>({
    uuid,
    initial: recording,
    name: "dataset",
    enabled,
    getFn: api.recordings.get,
  });

  const update = useMutation({
    mutationFn: api.recordings.update,
    onSuccess: onUpdate,
  });

  const addTag = useMutation({
    mutationFn: api.recordings.addTag,
    onSuccess: onAddTag,
  });

  const removeTag = useMutation({
    mutationFn: api.recordings.removeTag,
    onSuccess: onRemoveTag,
  });

  const addNote = useMutation({
    mutationFn: api.recordings.addNote,
    onSuccess: onAddNote,
  });

  const addFeature = useMutation({
    mutationFn: api.recordings.addFeature,
    onSuccess: onAddFeature,
  });

  const removeFeature = useMutation({
    mutationFn: api.recordings.removeFeature,
    onSuccess: onRemoveFeature,
  });

  const updateFeature = useMutation({
    mutationFn: api.recordings.updateFeature,
    onSuccess: onUpdateFeature,
  });

  const deleteRecording = useMutation({
    mutationFn: api.recordings.delete,
    onSuccess: onDelete,
  });

  return {
    ...query,
    update,
    addTag,
    removeTag,
    addNote,
    addFeature,
    removeFeature,
    updateFeature,
    delete: deleteRecording,
    set,
  } as const;
}
