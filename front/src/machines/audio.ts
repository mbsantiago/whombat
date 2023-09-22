import { assign, createMachine } from "xstate";

import { type Recording } from "@/api/recordings";

export type GetAudioUrlFn = ({
  recording_id,
  speed,
}: {
  recording_id: number;
  speed?: number;
}) => string;

export type AudioContext = {
  audio: HTMLAudioElement;
  recording: Recording;
  startTime: number;
  endTime: number;
  currentTime: number;
  muted: boolean;
  volume: number;
  loop: boolean;
  speed: number;
  getAudioURL: GetAudioUrlFn;
};

export type SeekEvent = { type: "SEEK"; time: number };
export type SetVolumeEvent = { type: "SET_VOLUME"; volume: number };
export type SetSpeedEvent = { type: "SET_SPEED"; speed: number };
export type ChangeRecordingEvent = {
  type: "CHANGE_RECORDING";
  recording: Recording;
};
export type SetTimeEvent = { type: "SET_TIME"; time: number };
export type SetStartTimeEvent = { type: "SET_START_TIME"; time: number };
export type SetEndTimeEvent = { type: "SET_END_TIME"; time: number };

export type AudioEvent =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STOP" }
  | { type: "MUTE" }
  | { type: "UNMUTE" }
  | { type: "TOGGLE_LOOP" }
  | SeekEvent
  | SetVolumeEvent
  | SetSpeedEvent
  | ChangeRecordingEvent
  | SetTimeEvent
  | SetStartTimeEvent
  | SetEndTimeEvent;

export const audioStates = {
  initial: "setup",
  states: {
    setup: {
      invoke: {
        src: "setupAudio",
      },
      always: {
        target: "stopped",
      },
    },
    stopped: {
      on: {
        PLAY: {
          target: "playing",
          actions: ["play"],
        },
      },
    },
    playing: {
      invoke: {
        src: "playing",
      },
      on: {
        PAUSE: {
          target: "paused",
          actions: ["pause"],
        },
        STOP: {
          target: "stopped",
          actions: ["stop"],
        },
        // NOTE: When these actions are called in the playing state, they
        // should force an external transition to the playing state so
        // that the playing service is restarted with the correct
        // context.
        TOGGLE_LOOP: {
          actions: ["toggleLoop"],
          target: "playing",
        },
        CHANGE_RECORDING: {
          actions: ["changeRecording"],
          target: "playing",
        },
        SET_START_TIME: {
          actions: ["setStartTime"],
          target: "playing",
        },
        SET_END_TIME: {
          actions: ["setEndTime"],
          target: "playing",
        },
      },
    },
    paused: {
      on: {
        PLAY: {
          target: "playing",
          actions: ["play"],
        },
      },
    },
  },
  on: {
    SEEK: {
      actions: ["seek"],
    },
    MUTE: {
      actions: ["mute"],
    },
    UNMUTE: {
      actions: ["unmute"],
    },
    SET_VOLUME: {
      actions: ["setVolume"],
    },
    TOGGLE_LOOP: {
      actions: ["toggleLoop"],
    },
    SET_SPEED: {
      target: "setup",
      actions: ["setSpeed", "stop"],
    },
    CHANGE_RECORDING: {
      actions: ["changeRecording"],
    },
    SET_START_TIME: {
      actions: ["setStartTime"],
    },
    SET_END_TIME: {
      actions: ["setEndTime"],
    },
    SET_TIME: {
      actions: ["setTime"],
    },
  },
};

export const audioActions = {
  play: (context: AudioContext) => {
    context.audio.play();
  },
  pause: (context: AudioContext) => {
    context.audio.pause();
  },
  stop: (context: AudioContext) => {
    context.audio.pause();
    context.currentTime = context.startTime;
    context.audio.currentTime = context.startTime / context.speed;
  },
  seek: assign({
    currentTime: (context: AudioContext, event: SeekEvent) => {
      context.audio.currentTime = event.time / context.speed;
      return event.time;
    },
  }),
  mute: assign({
    muted: (context: AudioContext) => {
      context.audio.muted = true;
      return true;
    },
  }),
  unmute: assign({
    muted: (context: AudioContext) => {
      context.audio.muted = false;
      return false;
    },
  }),
  setVolume: assign({
    volume: (context: AudioContext, event: SetVolumeEvent) => {
      context.audio.volume = event.volume;
      return event.volume;
    },
  }),
  toggleLoop: assign({
    loop: (context: AudioContext) => {
      context.audio.loop = !context.audio.loop;
      return context.audio.loop;
    },
  }),
  setSpeed: assign({
    speed: (context: AudioContext, event: SetSpeedEvent) => {
      const url = context.getAudioURL({
        recording_id: context.recording.id,
        speed: event.speed,
      });
      context.audio.src = url;
      return event.speed;
    },
  }),
  changeRecording: assign({
    recording: (context: AudioContext, event: ChangeRecordingEvent) => {
      const url = context.getAudioURL({
        recording_id: event.recording.id,
        speed: context.speed,
      });
      context.audio.src = url;
      return event.recording;
    },
  }),
  setStartTime: assign({
    startTime: (_: AudioContext, event: SetStartTimeEvent) => {
      return event.time;
    },
    currentTime: (context: AudioContext, event: SetStartTimeEvent) => {
      context.audio.currentTime = Math.max(
        event.time * context.speed,
        context.audio.currentTime,
      );
      return context.audio.currentTime / context.speed;
    },
  }),
  setEndTime: assign({
    endTime: (_: AudioContext, event: SetEndTimeEvent) => {
      return event.time;
    },
    currentTime: (context: AudioContext, event: SetEndTimeEvent) => {
      context.audio.currentTime = Math.min(
        event.time * context.speed,
        context.audio.currentTime,
      );
      return context.audio.currentTime / context.speed;
    },
  }),
  setTime: assign({
    currentTime: (_: AudioContext, event: SetTimeEvent) => event.time,
  }),
};

export const audioServices = {
  playing: (context: AudioContext) => (send: any) => {
    let requestId: number;

    const onTimeUpdate = () => {
      // Get the current time of the audio element, adjusted for the speed
      const currentTime = context.audio.currentTime * context.speed;

      // If the current time is past the end time, stop the audio
      if (currentTime >= context.endTime && !context.loop) {
        send("STOP");
        return;
      }

      // If the current time is past the end time, loop back to the start
      // time
      if (currentTime >= context.endTime && context.loop) {
        send({ type: "SEEK", time: context.startTime });
      }

      // If the current time is before the start time, seek to the start
      // time
      if (currentTime < context.startTime) {
        send({ type: "SEEK", time: context.startTime });
      }

      // Otherwise update the current time
      send({
        type: "SET_TIME",
        time: currentTime,
      });

      // Request the next animation frame
      requestId = requestAnimationFrame(onTimeUpdate);
    };

    // Create a request animation frame loop to update the current time
    requestId = requestAnimationFrame(onTimeUpdate);

    return () => {
      // Cancel the request animation frame loop when the service is
      // stopped
      cancelAnimationFrame(requestId);
    };
  },
  setupAudio: (context: AudioContext) => () => {
    // Create an audio element
    const audio = new Audio();
    context.audio = audio;

    // Set the audio element URL
    const url = context.getAudioURL({
      recording_id: context.recording.id,
      speed: context.speed,
    });
    audio.src = url;

    // Create a listener to update the current time when the audio
    // has loaded the metadata
    const onLoadedMetadata = () => {
      audio.currentTime = context.startTime / context.speed;
    };

    // Attach the listener to the audio element
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
  },
};

export const audioMachine = createMachine<AudioContext, AudioEvent>(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AudioContext,
      events: {} as AudioEvent,
    },
    id: "audio",
    ...audioStates,
  },
  {
    // @ts-ignore
    actions: audioActions,
    services: audioServices,
  },
);
