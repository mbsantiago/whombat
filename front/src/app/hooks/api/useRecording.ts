import { type AxiosError } from "axios";
import toast from "react-hot-toast";
import { useMemo } from "react";

import api from "@/app/api";
import useObject from "@/lib/hooks/utils/useObject";

import type { Recording } from "@/lib/types";

export default function useRecording({
  uuid,
  enabled = true,
  onUpdate,
  onDelete,
  onAddTag,
  onAddNote,
  onRemoveTag,
  onAddFeature,
  onRemoveFeature,
  onUpdateFeature,
  onError,
}: {
  uuid?: string;
  enabled?: boolean;
  onUpdate?: (recording: Recording) => void;
  onDelete?: (recording: Recording) => void;
  onAddTag?: (recording: Recording) => void;
  onAddNote?: (recording: Recording) => void;
  onRemoveTag?: (recording: Recording) => void;
  onAddFeature?: (recording: Recording) => void;
  onRemoveFeature?: (recording: Recording) => void;
  onUpdateFeature?: (recording: Recording) => void;
  onError?: (error: AxiosError) => void;
}) {}
