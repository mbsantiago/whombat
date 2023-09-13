import {
  useRef,
  useCallback,
  useMemo,
  type SyntheticEvent,
} from "react";
import { useSetState, useHarmonicIntervalFn } from "react-use";
import api from "@/app/api";
import { type Recording } from "@/api/recordings";

export type GetAudioUrlFn = ({
  recording_id,
  speed,
}: {
  recording_id: number;
  speed?: number;
}) => string;

export type AudioState = {
  time: number;
  startTime: number;
  endTime: number;
  duration: number;
  muted: boolean;
  volume: number;
  paused: boolean;
  playing: boolean;
  speed: number;
  loop: boolean;
  samplerate: number;
};

export type AudioControls = {
  play: () => void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  volume: (volume: number) => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
};

export default function useAudio({
  recording,
  startTime: initialStartTime = 0,
  endTime: initialEndTime,
  speed: initialSpeed = 1,
  loop: initialLoop = false,
  getAudioUrl = api.audio.getStreamUrl,
}: {
  recording: Recording;
  speed?: number;
  startTime?: number;
  endTime?: number;
  loop?: boolean;
  getAudioUrl?: GetAudioUrlFn;
}) {
  // create state container
  const [state, setState] = useSetState<AudioState>({
    time: initialStartTime ?? 0,
    duration: recording.duration,
    startTime: initialStartTime ?? 0,
    endTime: initialEndTime ?? recording.duration,
    muted: false,
    volume: 1,
    paused: true,
    playing: false,
    speed: initialSpeed,
    loop: initialLoop,
    samplerate: recording.samplerate,
  });

  const {
    startTime,
    endTime,
    speed,
    loop,
  } = state;

  const ref = useRef<HTMLAudioElement>(null);

  const onPlay = useCallback(() => setState({ paused: false }), []);

  const onPlaying = useCallback(
    (event: SyntheticEvent<HTMLAudioElement>) => {
      setState({ playing: true });

      const el = event.currentTarget;

      // Make sure the audio doesn't play anything before the start time
      if (el.currentTime >= endTime / speed) {
        el.currentTime = startTime / speed;
        return;
      }

      // Or after the end time
      if (el.currentTime < startTime / speed) {
        el.currentTime = startTime / speed;
      }
    },
    [startTime, endTime, speed],
  );

  const onWaiting = useCallback(() => setState({ playing: false }), []);

  const onPause = useCallback(
    () => setState({ paused: true, playing: false }),
    [],
  );

  const onVolumeChange = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setState({
      muted: el.muted,
      volume: el.volume,
    });
  }, []);

  const onDurationChange = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const { duration } = el;
    setState({
      duration,
    });
  }, []);

  const onTimeUpdate = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    // Make sure the audio doesn't play anything before the start time
    if (el.currentTime < startTime / speed) {
      el.currentTime = startTime / speed;
    }

    // Make sure the el doesn't play anything after the end time
    if (el.currentTime >= endTime / speed) {
      el.currentTime = endTime / speed;

      // If the el is looping, loop back to the start time
      if (loop) {
        el.currentTime = startTime / speed;
      } else {
        el.pause();
      }
    }
  }, []);

  // Custom loaded metadata handler that makes sure the audio starts at the
  // desired time
  const onLoadedMetadata = useMemo(() => {
    if (startTime === 0) {
      return undefined;
    }
    return (event: SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;
      audio.currentTime = startTime;
    };
  }, [startTime]);

  const url = useMemo(
    () => getAudioUrl({ recording_id: recording.id, speed: speed }),
    [recording, speed, getAudioUrl],
  );

  const audio = useMemo(() => {
    return (
      <audio
        ref={ref}
        src={url}
        onPlay={onPlay}
        onPlaying={onPlaying}
        onWaiting={onWaiting}
        onPause={onPause}
        onVolumeChange={onVolumeChange}
        onDurationChange={onDurationChange}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        loop={loop}
      />
    );
  }, [
    url,
    loop,
    onPlay,
    onPlaying,
    onWaiting,
    onPause,
    onVolumeChange,
    onDurationChange,
    onTimeUpdate,
    onLoadedMetadata,
  ]);

  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  let lockPlay: boolean = false;

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }
    const promise = el.play();
    const isPromise = typeof promise === "object";

    if (isPromise) {
      lockPlay = true;
      const resetLock = () => {
        lockPlay = false;
      };
      promise.then(resetLock, resetLock);
    }

    return promise;
  }, []);

  const pause = useCallback(() => {
    const el = ref.current;
    if (el && !lockPlay) {
      return el.pause();
    }
  }, []);

  const seek = useCallback(
    (time: number) => {
      const el = ref.current;
      if (!el || endTime === undefined) {
        return;
      }
      time = Math.min(endTime, Math.max(startTime, time));
      el.currentTime = time;
    },
    [endTime, startTime],
  );

  const volume = useCallback((volume: number) => {
    const el = ref.current;
    if (!el) {
      return;
    }
    volume = Math.min(1, Math.max(0, volume));
    el.volume = volume;
    setState({ volume });
  }, []);

  const mute = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.muted = true;
  }, []);

  const unmute = useCallback(() => {
    const el = ref.current;

    if (!el) {
      return;
    }
    el.muted = false;
  }, []);

  // This hook updates the time of the audio element
  useHarmonicIntervalFn(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    setState({ time: el.currentTime });
  }, 1000 / 24);

  const setSpeed = useCallback((speed: number) => {
    setState({ speed, playing: false });
  }, []);

  const controls = useMemo<AudioControls>(
    () => ({
      play,
      pause,
      seek,
      volume,
      mute,
      unmute,
      setSpeed,
      setLoop: (loop: boolean) => setState({ loop }),
    }),
    [play, pause, seek, volume, mute, unmute, setState, setSpeed],
  );

  return {
    audio,
    state,
    controls,
    ref,
  };
}
