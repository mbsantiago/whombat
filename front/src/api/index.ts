/**
 * Whombat Javascript API
 *
 * This file is the entry point for the Whombat Javascript API.
 * Use the API to interact with the Whombat backend.
 */
import axios from "axios";

import { registerAnnotationProjectAPI } from "./annotation_projects";
import { registerSoundEventAnnotationsAPI } from "./sound_event_annotations";
import { registerClipAnnotationsAPI } from "./clip_annotations";
import { registerAudioAPI } from "./audio";
import { registerAuthAPI } from "./auth";
import { registerClipAPI } from "./clips";
import { registerDatasetAPI } from "./datasets";
import { registerEvaluationSetAPI } from "./evaluation_sets";
import { registerNotesAPI } from "./notes";
import { registerRecordingAPI } from "./recordings";
import { registerSoundEventAPI } from "./sound_events";
import { registerSpectrogramAPI } from "./spectrograms";
import { registerTagAPI } from "./tags";
import { registerAnnotationTasksAPI } from "./annotation_tasks";
import { registerUserAPI } from "./user";
import { registerPluginsAPI } from "./plugins";
import { registerSoundEventPredictionsAPI } from "./sound_event_predictions";
import { registerClipPredictionsAPI } from "./clip_predictions";
import { registerModelRunAPI } from "./model_runs";
import { registerUserRunAPI } from "./user_runs";
import { registerSoundEventEvaluationAPI } from "./sound_event_evaluations";
import { registerClipEvaluationAPI } from "./clip_evaluations";
import { registerEvaluationAPI } from "./evaluations";

type APIConfig = {
  baseURL: string;
  withCredentials: boolean;
};

const DEFAULT_CONFIG: APIConfig = {
  baseURL: "http://localhost:5000",
  withCredentials: true,
};

/**
 * Create an instance of the Whombat API.
 */
export default function createAPI(config: APIConfig = DEFAULT_CONFIG) {
  let instance = axios.create(config);
  return {
    annotation_projects: registerAnnotationProjectAPI(instance),
    sound_event_annotations: registerSoundEventAnnotationsAPI(instance),
    clip_annotations: registerClipAnnotationsAPI(instance),
    audio: registerAudioAPI({ baseUrl: config.baseURL }),
    auth: registerAuthAPI(instance),
    clips: registerClipAPI(instance),
    datasets: registerDatasetAPI({ instance, baseUrl: config.baseURL }),
    evaluation_sets: registerEvaluationSetAPI(instance),
    notes: registerNotesAPI(instance),
    recordings: registerRecordingAPI(instance),
    sound_events: registerSoundEventAPI(instance),
    spectrograms: registerSpectrogramAPI({ baseUrl: config.baseURL }),
    tags: registerTagAPI(instance),
    annotation_tasks: registerAnnotationTasksAPI(instance),
    user: registerUserAPI(instance),
    plugins: registerPluginsAPI(instance),
    sound_event_predictions: registerSoundEventPredictionsAPI(instance),
    clip_predictions: registerClipPredictionsAPI(instance),
    model_runs: registerModelRunAPI(instance),
    user_runs: registerUserRunAPI(instance),
    clip_evaluations: registerClipEvaluationAPI(instance),
    sound_event_evaluations: registerSoundEventEvaluationAPI(instance),
    evaluations: registerEvaluationAPI(instance),
  } as const;
}
