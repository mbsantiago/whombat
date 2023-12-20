import { assign, setup, fromCallback, sendTo } from "xstate";

export type AudioInput = {
  url: string;
  loop?: boolean;
  currentTime?: number;
  volume?: number;
};

export type AudioContext = {
  url: string;
  currentTime: number;
  muted: boolean;
  volume: number;
  loop: boolean;
};

export type SeekEvent = { type: "audio.seek"; time: number };
export type SetVolumeEvent = { type: "audio.set_volume"; volume: number };
export type ChangeURLEvent = {
  type: "audio.change_url";
  url: string;
  time?: number;
  play?: boolean;
};
export type SetTimeEvent = { type: "audio.set_time"; currentTime: number };
export type AudioEvent =
  | { type: "audio.ready" }
  | { type: "audio.play" }
  | { type: "audio.pause" }
  | { type: "audio.stop" }
  | { type: "audio.mute" }
  | { type: "audio.unmute" }
  | { type: "audio.toggle_loop" }
  | SeekEvent
  | SetVolumeEvent
  | ChangeURLEvent
  | SetTimeEvent;

export const audioMachine = setup({
  types: {} as {
    context: AudioContext;
    events: AudioEvent;
    input: AudioInput;
  },
  actors: {
    audio: fromCallback<AudioEvent, AudioInput>(
      ({ sendBack, receive, input }) => {
        const audio = new Audio();
        audio.src = input.url;
        audio.loop = input.loop || false;
        audio.currentTime = input.currentTime || 0;

        const onLoadStart = () => sendBack({ type: "audio.ready" });
        audio.addEventListener("canplay", onLoadStart);

        receive((event: AudioEvent) => {
          switch (event.type) {
            case "audio.play":
              audio.play();
              break;
            case "audio.pause":
              audio.pause();
              break;
            case "audio.stop":
              audio.pause();
              audio.currentTime = 0;
              break;
            case "audio.seek":
              audio.currentTime = event.time;
              audio.play();
              break;
            case "audio.mute":
              audio.muted = true;
              break;
            case "audio.unmute":
              audio.muted = false;
              break;
            case "audio.set_volume":
              audio.volume = event.volume;
              break;
            case "audio.toggle_loop":
              audio.loop = !audio.loop;
              break;
            case "audio.change_url":
              audio.src = event.url;
              if (event.time) {
                audio.currentTime = event.time;
              }
              if (event.play) {
                audio.play();
              }
              break;
          }
        });

        // Update the current time of the audio element
        let request: number;
        const updateTime = () => {
          sendBack({ type: "audio.set_time", currentTime: audio.currentTime });
          if (!audio.paused) {
            request = requestAnimationFrame(updateTime);
          }
        };

        const onPlay = () => {
          request = requestAnimationFrame(updateTime);
          sendBack({ type: "audio.play" });
        };
        audio.addEventListener("play", onPlay);

        const onPause = () => {
          cancelAnimationFrame(request);
          sendBack({ type: "audio.pause" });
        };
        audio.addEventListener("pause", onPause);

        return () => {
          audio.removeEventListener("canplay", onLoadStart);
          audio.removeEventListener("play", onPlay);
          audio.removeEventListener("pause", onPause);
          cancelAnimationFrame(request);
        };
      },
    ),
  },
})
  .createMachine({
    context: ({ input }) => ({
      currentTime: input.currentTime || 0,
      muted: false,
      volume: input.volume || 1,
      loop: input.loop || false,
      url: input.url,
    }),
    id: "audio",
    initial: "setup",
    invoke: {
      id: "audio",
      src: "audio",
      input: ({ context }) => ({
        url: context.url,
        loop: context.loop,
        currentTime: context.currentTime,
        volume: context.volume,
      }),
    },
    states: {
      setup: {
        on: {
          "audio.ready": {
            target: "stopped",
          },
        },
      },
      stopped: {
        on: {
          "audio.play": {
            target: "playing",
            actions: [{ type: "play" }],
          },
        },
      },
      playing: {
        on: {
          "audio.pause": {
            target: "paused",
            actions: [{ type: "pause" }],
          },
          "audio.stop": {
            target: "stopped",
            actions: [{ type: "stop" }],
          },
          "audio.toggle_loop": {
            actions: [{ type: "toggleLoop" }],
            target: "playing",
          },
          "audio.change_url": {
            actions: [{ type: "changeURL" }],
            target: "setup",
          },
        },
      },
      paused: {
        on: {
          "audio.play": {
            target: "playing",
            actions: [{ type: "play" }],
          },
        },
      },
    },
    on: {
      "audio.seek": {
        actions: [{ type: "seek" }],
      },
      "audio.mute": {
        actions: [{ type: "mute" }],
      },
      "audio.unmute": {
        actions: [{ type: "unmute" }],
      },
      "audio.set_volume": {
        actions: [{ type: "setVolume" }],
      },
      "audio.toggle_loop": {
        actions: [{ type: "toggleStateLoop" }, { type: "toggleAudioLoop" }],
      },
      "audio.change_url": {
        actions: [{ type: "changeURL" }],
      },
      "audio.set_time": {
        actions: [{ type: "setTime" }],
      },
    },
  })
  .provide({
    actions: {
      seek: sendTo("audio", ({ event }) => {
        if (event.type === "audio.seek") {
          return { type: "audio.seek", time: event.time };
        }
      }),
      mute: sendTo("audio", { type: "audio.mute" }),
      unmute: sendTo("audio", { type: "audio.unmute" }),
      play: sendTo("audio", { type: "audio.play" }),
      pause: sendTo("audio", { type: "audio.pause" }),
      stop: sendTo("audio", { type: "audio.stop" }),
      setVolume: sendTo("audio", ({ event }) => {
        if (event.type === "audio.set_volume") {
          return { type: "audio.set_volume", volume: event.volume };
        }
      }),
      toggleAudioLoop: sendTo("audio", { type: "audio.toggle_loop" }),
      toggleStateLoop: assign({ loop: ({ context }) => !context.loop }),
      changeURL: sendTo("audio", ({ event }) => {
        if (event.type === "audio.change_url") {
          return { type: "audio.change_url", url: event.url };
        }
      }),
      setTime: assign({
        currentTime: ({ context, event }) => {
          if (event.type === "audio.set_time") {
            return event.currentTime;
          }
          return context.currentTime;
        },
      }),
    },
  });
