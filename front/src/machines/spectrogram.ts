import { ActorRefFrom, assign, createMachine, spawn } from "xstate";

import {
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
} from "@/utils/windows";
import {
  type SpectrogramParameters,
  type SpectrogramWindow,
} from "@/api/spectrograms";
import { type Recording } from "@/api/recordings";
import { audioMachine } from "@/machines/audio";
import api from "@/app/api";

export type SpectrogramContext = {
  recording: Recording;
  initial: SpectrogramWindow;
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
  parameters: SpectrogramParameters;
  audio: ActorRefFrom<typeof audioMachine>;
};

export type ChangeRecordingEvent = {
  type: "CHANGE_RECORDING";
  recording: Recording;
};

export type SetWindowEvent = {
  type: "SET_WINDOW";
  window: SpectrogramWindow;
};

export type SetParameterEvent = {
  type: "SET_PARAMETER";
  key: keyof SpectrogramParameters;
  value: any;
};

export type ClearParameterEvent = {
  type: "CLEAR_PARAMETER";
  key: keyof SpectrogramParameters;
};

export type ZoomToEvent = { type: "ZOOM_TO"; window: SpectrogramWindow };
export type PanToEvent = { type: "PAN_TO"; window: SpectrogramWindow };
export type CenterOnEvent = { type: "CENTER_ON"; time: number };
export type ShiftWindowEvent = {
  type: "SHIFT_WINDOW";
  shiftBy: { time: number; freq: number };
  relative?: boolean;
};
export type ScaleWindowEvent = {
  type: "SCALE_WINDOW";
  scaleBy: { time?: number; freq?: number };
};

export type UpdateEvent = {
  type: "UPDATE";
  bounds: SpectrogramWindow;
  initial: SpectrogramWindow;
};

export type SpectrogramEvent =
  | { type: "PAN" }
  | { type: "ZOOM" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESET" }
  | { type: "DISABLE" }
  | ChangeRecordingEvent
  | SetWindowEvent
  | SetParameterEvent
  | ClearParameterEvent
  | UpdateEvent
  | PanToEvent
  | ZoomToEvent
  | CenterOnEvent
  | ShiftWindowEvent
  | ScaleWindowEvent;

export const spectrogramStates = {
  initial: "panning",
  states: {
    idle: {},
    panning: {
      on: {
        PAN_TO: {
          actions: ["panTo"],
        },
      },
    },
    zooming: {
      on: {
        ZOOM_TO: {
          actions: ["zoomTo"],
          target: "panning",
        },
      },
    },
    playing: {
      on: {
        CENTER_ON: {
          actions: ["centerOn"],
        },
        PAUSE: "panning",
      },
      entry: ["play"],
      exit: ["pause"],
    },
  },
  on: {
    // Actions that change state and can be performed in any state
    DISABLE: "idle",
    PAN: "panning",
    ZOOM: "zooming",
    PLAY: "playing",
    RESET: {
      actions: ["reset"],
      target: "panning",
    },
    // Actions that can be performed in any state
    UPDATE: {
      actions: ["update"],
    },
    SET_PARAMETER: {
      actions: ["setParameter"],
    },
    CLEAR_PARAMETER: {
      actions: ["clearParameter"],
    },
    CHANGE_RECORDING: {
      actions: ["changeRecording"],
    },
    SHIFT_WINDOW: {
      actions: ["shiftWindow"],
    },
    SCALE_WINDOW: {
      actions: ["scaleWindow"],
    },
  },
  entry: ["initAudio"],
};

export const spectrogramActions = {
  play: (context: SpectrogramContext) => {
    context.audio.send("PLAY");
  },
  pause: (context: SpectrogramContext) => {
    context.audio.send("PAUSE");
  },
  setParameter: assign({
    parameters: (
      context: SpectrogramContext,
      event: SetParameterEvent,
    ): SpectrogramParameters => {
      return validateParameters({
        parameters: {
          ...context.parameters,
          [event.key]: event.value,
        },
        recording: context.recording,
      });
    },
  }),
  clearParameter: assign({
    parameters: (
      context: SpectrogramContext,
      event: ClearParameterEvent,
    ): SpectrogramParameters => {
      const { [event.key]: _, ...rest } = context.parameters;
      return validateParameters({
        parameters: rest,
        recording: context.recording,
      });
    },
  }),
  zoomTo: assign({
    window: (context: SpectrogramContext, event: ZoomToEvent) =>
      adjustWindowToBounds(event.window, context.bounds),
  }),
  panTo: assign({
    window: (context: SpectrogramContext, event: PanToEvent) =>
      adjustWindowToBounds(event.window, context.bounds),
  }),
  centerOn: assign({
    window: (context: SpectrogramContext, event: CenterOnEvent) =>
      adjustWindowToBounds(
        centerWindowOn(context.window, event),
        context.bounds,
      ),
  }),
  shiftWindow: assign({
    window: (context: SpectrogramContext, event: ShiftWindowEvent) =>
      adjustWindowToBounds(
        shiftWindow(context.window, event.shiftBy, event.relative),
        context.bounds,
      ),
  }),
  scaleWindow: assign({
    window: (context: SpectrogramContext, event: ScaleWindowEvent) =>
      adjustWindowToBounds(
        scaleWindow(context.window, event.scaleBy),
        context.bounds,
      ),
  }),
  reset: assign({
    window: (context: SpectrogramContext) =>
      adjustWindowToBounds(context.initial, context.bounds),
  }),
  update: assign({
    bounds: (context, event: UpdateEvent) => {
      context.audio.send({
        type: "SET_START_TIME",
        time: event.bounds.time.min,
      });
      context.audio.send({ type: "SET_END_TIME", time: event.bounds.time.max });
      return event.bounds;
    },
    initial: (_, event: UpdateEvent) => event.initial,
    window: (_: SpectrogramContext, event: UpdateEvent) => {
      return event.initial;
    },
  }),
  changeRecording: assign({
    recording: (context: SpectrogramContext, event: ChangeRecordingEvent) => {
      context.audio.send({
        type: "CHANGE_RECORDING",
        recording: event.recording,
      });
      return event.recording;
    },
  }),
  initAudio: assign({
    // @ts-ignore
    audio: (context: SpectrogramContext) => {
      if (context.audio != null) {
        return context.audio;
      }
      return spawn(
        audioMachine.withContext({
          audio: new Audio(),
          recording: context.recording,
          startTime: context.bounds.time.min,
          endTime: context.bounds.time.max,
          currentTime: context.bounds.time.min,
          muted: false,
          volume: 1,
          speed: 1,
          loop: false,
          getAudioURL: api.audio.getStreamUrl,
        }),
      );
    },
  }),
};

export const spectrogramMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as SpectrogramContext,
      events: {} as SpectrogramEvent,
    },
    id: "spectrogram",
    ...spectrogramStates,
  },
  {
    // @ts-ignore
    actions: spectrogramActions,
  },
);

function validateParameters({
  parameters,
  recording,
}: {
  parameters: SpectrogramParameters;
  recording?: Recording;
}): SpectrogramParameters {
  if (!recording) {
    return parameters;
  }

  const constrained: Partial<SpectrogramParameters> = {};

  // We need to constrain the maximum filtered, otherwise filtering
  // will fail
  if (parameters.high_freq != null) {
    // Use the samplerate of the recording, or the target sampling rate
    // if resampling is enabled.
    const samplerate = parameters.resample
      ? parameters.samplerate ?? recording.samplerate
      : recording.samplerate;

    // The maximum frequency is half the sampling rate, minus a bit
    // to avoid aliasing.
    const maxValue = Math.round((samplerate / 2) * 0.95);
    constrained.high_freq = Math.min(parameters.high_freq, maxValue);

    // Check that the low frequency is not higher than the high frequency.
    if (parameters.low_freq != null) {
      constrained.low_freq = Math.min(
        parameters.low_freq,
        parameters.high_freq - 1,
      );
    }
  }

  return { ...parameters, ...constrained };
}
