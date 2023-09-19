import { createMachine, assign, ActorRefFrom } from "xstate";
import {
  adjustWindowToBounds,
  centerWindowOn,
  shiftWindow,
  scaleWindow,
} from "@/hooks/useWindow";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
} from "@/api/spectrograms";
import { type Recording } from "@/api/recordings";
import { audioMachine } from "@/machines/audio";

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
export type SetParametersEvent = {
  type: "SET_PARAMETERS";
  parameters: SpectrogramParameters;
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
  | ChangeRecordingEvent
  | SetWindowEvent
  | SetParametersEvent
  | UpdateEvent
  | PanToEvent
  | ZoomToEvent
  | CenterOnEvent
  | ShiftWindowEvent
  | ScaleWindowEvent;

export const spectrogramStates = {
  initial: "panning",
  states: {
    panning: {
      on: {
        RESET: {
          actions: ["reset"],
        },
        ZOOM: "zooming",
        PLAY: "playing",
        PAN_TO: {
          actions: ["panTo"],
        },
        SHIFT_WINDOW: {
          actions: ["shiftWindow"],
        },
        SCALE_WINDOW: {
          actions: ["scaleWindow"],
        },
      },
    },
    zooming: {
      on: {
        PLAY: "playing",
        PAN: "panning",
        RESET: {
          actions: ["reset"],
          target: "panning",
        },
        ZOOM_TO: {
          actions: ["zoomTo"],
          target: "panning",
        },
      },
    },
    playing: {
      on: {
        PAN: "panning",
        ZOOM: "zooming",
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
    UPDATE: {
      actions: ["onUpdate"],
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
  onUpdate: assign({
    bounds: (_, event: UpdateEvent) => event.bounds,
    initial: (_, event: UpdateEvent) => event.initial,
    window: (context: SpectrogramContext, event: UpdateEvent) => {
      return adjustWindowToBounds(context.window, event.bounds);
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
