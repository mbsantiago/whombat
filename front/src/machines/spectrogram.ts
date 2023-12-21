import { assign, createMachine } from "xstate";

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
import { type Recording } from "@/api/schemas";

export type SpectrogramContext = {
  recording: Recording;
  initial: SpectrogramWindow;
  window: SpectrogramWindow;
  bounds: SpectrogramWindow;
  parameters: SpectrogramParameters;
};

export type SetWindowEvent = {
  type: "spectrogram.set_window";
  window: SpectrogramWindow;
};

export type SetParameterEvent<T extends keyof SpectrogramParameters> = {
  type: "spectrogram.set_parameter";
  key: T;
  value: SpectrogramParameters[T];
};

export type ClearParameterEvent = {
  type: "spectrogram.clear_parameter";
  key: keyof SpectrogramParameters;
};

export type ZoomToEvent = {
  type: "spectrogram.zoom_to";
  window: SpectrogramWindow;
};
export type PanToEvent = {
  type: "spectrogram.pan_to";
  window: SpectrogramWindow;
};
export type CenterOnEvent = { type: "spectrogram.center_on"; time: number };
export type ShiftWindowEvent = {
  type: "spectrogram.shift_window";
  shiftBy: { time: number; freq: number };
  relative?: boolean;
};
export type ScaleWindowEvent = {
  type: "spectrogram.scale_window";
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
  | SetWindowEvent
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
  },
  on: {
    // Actions that change state and can be performed in any state
    DISABLE: ".idle",
    PAN: ".panning",
    ZOOM: ".zooming",
    PLAY: ".playing",
    RESET: {
      actions: ["reset"],
      target: ".panning",
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
};

export const spectrogramActions = {
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
      return event.bounds;
    },
    initial: (_, event: UpdateEvent) => event.initial,
    window: (_: SpectrogramContext, event: UpdateEvent) => {
      return event.initial;
    },
  }),
  changeRecording: assign({
    recording: (context: SpectrogramContext, event: ChangeRecordingEvent) => {
      return event.recording;
    },
  }),
};

export const spectrogramMachine = createMachine(
  {
    context: () => ({}),
    types: {
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
