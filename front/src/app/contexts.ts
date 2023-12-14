import { createContext } from "react";

import { type AnnotationProject } from "@/api/annotation_projects";
import { type User, type UserUpdate } from "@/api/user";
import { type Dataset, type DatasetUpdate } from "@/api/datasets";
import { type Tag } from "@/api/schemas";
import {
  EvaluationMode,
  type EvaluationSet,
  type EvaluationSetUpdate,
} from "@/api/evaluation_sets";

export type UserContextType = {
  user: User;
  logout?: () => void;
  update?: (data: UserUpdate) => void;
};

export const UserContext = createContext<UserContextType>({
  user: {
    id: "null",
    username: "anonymous",
    email: "",
    name: "anonymous",
    is_active: false,
    is_superuser: false,
  },
});

type RecordingContextType = {
  recording_id: number;
};

export const RecordingContext = createContext<RecordingContextType>({
  recording_id: -1,
});

export const AnnotationProjectContext = createContext<AnnotationProject>({
  id: -1,
  name: "",
  description: "",
  tags: [],
  created_on: new Date(),
  uuid: "",
});

type DatasetContextType = {
  dataset: Dataset | null;
  isLoading: boolean;
  onChange?: (dataset: DatasetUpdate) => void;
  onDelete?: () => void;
  downloadLink?: string;
};

export const DatasetContext = createContext<DatasetContextType>({
  dataset: null,
  isLoading: true,
});

type EvaluationSetContextType = {
  evaluationSet: EvaluationSet;
  update?: (data: EvaluationSetUpdate) => Promise<EvaluationSet>;
  delete?: () => Promise<EvaluationSet>;
  addTag?: (tag: Tag) => Promise<EvaluationSet>;
  removeTag?: (tag: Tag) => Promise<EvaluationSet>;
};

export const EvaluationSetContext = createContext<EvaluationSetContextType>({
  evaluationSet: {
    id: -1,
    name: "",
    description: "",
    tags: [],
    uuid: "",
    mode: EvaluationMode.CLIP_CLASSIFICATION,
    created_on: new Date(),
  },
});
