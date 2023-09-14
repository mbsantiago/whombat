/**
 * Whombat Javascript API
 *
 * This file is the entry point for the Whombat Javascript API.
 * Use the API to interact with the Whombat backend.
 */
import axios from "axios";
import { registerNotesAPI } from "./notes";
import { registerAuthAPI } from "./auth";
import { registerTagAPI } from "./tags";
import { registerUserAPI } from "./user";
import { registerDatasetAPI } from "./datasets";
import { registerRecordingAPI } from "./recordings";
import { registerAnnotationProjectAPI } from "./annotation_projects";
import { registerClipApi } from "./clips";
import { registerTasksApi } from "./tasks";
import { registerSpectrogramApi } from "./spectrograms";
import { registerAudioApi } from "./audio";
import { registerSoundEventApi } from "./sound_events";
import { registerAnnotationsApi } from "./annotations";

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
    auth: registerAuthAPI(instance),
    tags: registerTagAPI(instance),
    user: registerUserAPI(instance),
    datasets: registerDatasetAPI({ instance, baseUrl: config.baseURL }),
    recordings: registerRecordingAPI(instance),
    annotation_projects: registerAnnotationProjectAPI(instance),
    tasks: registerTasksApi(instance),
    clips: registerClipApi(instance),
    spectrograms: registerSpectrogramApi({ baseUrl: config.baseURL }),
    notes: registerNotesAPI(instance),
    audio: registerAudioApi({ baseUrl: config.baseURL }),
    sound_events: registerSoundEventApi(instance),
    annotations: registerAnnotationsApi(instance),
  };
}
