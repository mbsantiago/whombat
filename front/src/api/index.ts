/**
 * Whombat Javascript API
 *
 * This file is the entry point for the Whombat Javascript API.
 * Use the API to interact with the Whombat backend.
 */
import axios from "axios";

import { registerAnnotationProjectAPI } from "./annotation_projects";
import { registerAnnotationsApi } from "./annotations";
import { registerAudioApi } from "./audio";
import { registerAuthAPI } from "./auth";
import { registerClipApi } from "./clips";
import { registerDatasetAPI } from "./datasets";
import { registerEvaluationSetAPI } from "./evaluation_sets";
import { registerEvaluationTaskAPI } from "./evaluation_tasks";
import { registerNotesAPI } from "./notes";
import { registerPredictionRunAPI } from "./prediction_runs";
import { registerRecordingAPI } from "./recordings";
import { registerSoundEventApi } from "./sound_events";
import { registerSpectrogramApi } from "./spectrograms";
import { registerTagAPI } from "./tags";
import { registerTasksApi } from "./tasks";
import { registerUserAPI } from "./user";
import { registerPluginsAPI } from "./plugins";

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
    annotations: registerAnnotationsApi(instance),
    audio: registerAudioApi({ baseUrl: config.baseURL }),
    auth: registerAuthAPI(instance),
    clips: registerClipApi(instance),
    datasets: registerDatasetAPI({ instance, baseUrl: config.baseURL }),
    evaluation_sets: registerEvaluationSetAPI(instance),
    evaluation_tasks: registerEvaluationTaskAPI(instance),
    notes: registerNotesAPI(instance),
    prediction_runs: registerPredictionRunAPI(instance),
    recordings: registerRecordingAPI(instance),
    sound_events: registerSoundEventApi(instance),
    spectrograms: registerSpectrogramApi({ baseUrl: config.baseURL }),
    tags: registerTagAPI(instance),
    tasks: registerTasksApi(instance),
    user: registerUserAPI(instance),
    plugins: registerPluginsAPI(instance),
  };
}
