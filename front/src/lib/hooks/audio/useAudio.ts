import { useCallback, useState, useRef, useEffect } from "react";

export type AudioController = {
  /** Starts or resumes playback of the audio. */
  play: () => void;
  /** Pauses playback of the audio. */
  pause: () => void;
  /** Stops playback of the audio and resets the current time to 0. */
  stop: () => void;
  /** Sets the current playback time to the specified time in seconds. */
  seek: (time: number) => void;
  /** Sets the volume of the audio (0.0 to 1.0). */
  setVolume: (volume: number) => void;
  /** Toggles whether the audio will loop when it reaches the end. */
  toggleLoop: () => void;
  /** Toggles the playback state (play/pause). */
  togglePlay: () => void;
  /** The current volume level (0.0 to 1.0). */
  volume: number;
  /** The current playback time in seconds. */
  currentTime: number;
  /** Indicates whether the audio is set to loop. */
  loop: boolean;
  /** Indicates whether the audio is currently playing. */
  isPlaying: boolean;
};

/**
 * A custom React hook that provides comprehensive controls for playing audio.
 * It manages an HTMLAudioElement under the hood, handling playback, pausing,
 * seeking, volume control, and looping. Additionally, it supports a wide range
 * of event callbacks for granular control and customization.
 */
export default function useAudio({
  url,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onVolumeChange,
  onSeeking,
  onWaiting,
  onLoadStart,
  onLoadedData,
  onCanPlay,
  onCanPlayThrough,
}: {
  /** The URL of the audio file to play. */
  url: string;
  /** A callback that is called when the audio starts playing. */
  onPlay?: () => void;
  /** A callback that is called when the audio is paused. */
  onPause?: () => void;
  /** A callback that is called when the audio reaches the end. */
  onEnded?: () => void;
  /** A callback that is called when the audio encounters an error. */
  onError?: () => void;
  /** A callback that is called when the audio's current time is updated. */
  onTimeUpdate?: (time: number) => void;
  /** A callback that is called when the audio's volume is changed. */
  onVolumeChange?: (volume: number) => void;
  /** A callback that is called when the audio starts seeking. */
  onSeeking?: () => void;
  /** A callback that is called when the audio is waiting for data. */
  onWaiting?: () => void;
  /** Callback function called when the browser starts loading the audio. */
  onLoadStart?: () => void;
  /** Callback function called when the first frame of the audio has finished
   * loading. */
  onLoadedData?: () => void;
  /** Callback function called when the browser can start playing the audio. */
  onCanPlay?: () => void;
  /** Callback function called when the browser estimates it can play the audio
   * without buffering. */
  onCanPlayThrough?: () => void;
  /** Callback function called when the audio is aborted. */
  onAbort?: () => void;
}): AudioController {
  const audio = useRef<HTMLAudioElement>(new Audio());

  const [time, setTime] = useState<number>(0);
  const [loop, setLoop] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const { current } = audio;
    current.preload = "none";
    current.src = url;
    current.currentTime = 0;

    setIsPlaying(false);
    setTime(0);

    let timer: number;

    const updateTime = () => {
      if (current.paused) return;
      const currentTime = current.currentTime;
      setTime(currentTime);
      timer = requestAnimationFrame(updateTime);
    };

    timer = requestAnimationFrame(updateTime);

    const handlePlay = () => {
      timer = requestAnimationFrame(updateTime);
    };

    const handlePause = () => {
      cancelAnimationFrame(timer);
    };

    const handleError = () => {
      cancelAnimationFrame(timer);
    };

    const handleAbort = () => {
      cancelAnimationFrame(timer);
    };

    const handleEnded = () => {
      cancelAnimationFrame(timer);
      // set this explicitly to toggle button
      setIsPlaying(false);
      setTime(0);
    };

    current.addEventListener("play", handlePlay);
    current.addEventListener("pause", handlePause);
    current.addEventListener("error", handleError);
    current.addEventListener("ended", handleEnded);
    current.addEventListener("abort", handleAbort);

    return () => {
      // Make sure to remove the audio source to stop audio playback
      // and prevent memory leaks.
      current.src = "";

      cancelAnimationFrame(timer);
      current.removeEventListener("play", handlePlay);
      current.removeEventListener("pause", handlePause);
      current.removeEventListener("error", handleError);
      current.removeEventListener("ended", handleEnded);
      current.removeEventListener("abort", handleAbort);
    };
  }, [url]);

  useEffect(() => {
    if (onEnded == null) return;
    const { current } = audio;
    const handleTimeUpdate = () => onEnded();
    current.addEventListener("ended", handleTimeUpdate);
    return () => current.removeEventListener("ended", handleTimeUpdate);
  }, [onEnded]);

  useEffect(() => {
    if (onError == null) return;
    const { current } = audio;
    const handleError = () => onError();
    current.addEventListener("error", handleError);
    return () => current.removeEventListener("error", handleError);
  }, [onError]);

  useEffect(() => {
    if (onTimeUpdate == null) return;
    const { current } = audio;
    const handleTimeUpdate = () => onTimeUpdate(current.currentTime);
    current.addEventListener("timeupdate", handleTimeUpdate);
    return () => current.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onTimeUpdate]);

  useEffect(() => {
    if (onVolumeChange == null) return;
    const { current } = audio;
    const handleVolumeChange = () => onVolumeChange(current.volume);
    current.addEventListener("volumechange", handleVolumeChange);
    return () =>
      current.removeEventListener("volumechange", handleVolumeChange);
  }, [onVolumeChange]);

  useEffect(() => {
    if (onSeeking == null) return;
    const { current } = audio;
    const handleSeeking = () => onSeeking();
    current.addEventListener("seeking", handleSeeking);
    return () => current.removeEventListener("seeking", handleSeeking);
  }, [onSeeking]);

  useEffect(() => {
    if (onWaiting == null) return;
    const { current } = audio;
    const handleWaiting = () => onWaiting();
    current.addEventListener("waiting", handleWaiting);
    return () => current.removeEventListener("waiting", handleWaiting);
  }, [onWaiting]);

  useEffect(() => {
    if (onLoadStart == null) return;
    const { current } = audio;
    const handleLoadStart = () => onLoadStart();
    current.addEventListener("loadstart", handleLoadStart);
    return () => current.removeEventListener("loadstart", handleLoadStart);
  }, [onLoadStart]);

  useEffect(() => {
    if (onLoadedData == null) return;
    const { current } = audio;
    const handleLoadedData = () => onLoadedData();
    current.addEventListener("loadeddata", handleLoadedData);
    return () => current.removeEventListener("loadeddata", handleLoadedData);
  }, [onLoadedData]);

  useEffect(() => {
    if (onCanPlay == null) return;
    const { current } = audio;
    const handleCanPlay = () => onCanPlay();
    current.addEventListener("canplay", handleCanPlay);
    return () => current.removeEventListener("canplay", handleCanPlay);
  }, [onCanPlay]);

  useEffect(() => {
    if (onCanPlayThrough == null) return;
    const { current } = audio;
    const handleCanPlayThrough = () => onCanPlayThrough();
    current.addEventListener("canplaythrough", handleCanPlayThrough);
    return () =>
      current.removeEventListener("canplaythrough", handleCanPlayThrough);
  }, [onCanPlayThrough]);

  // Some browsers return `Promise` on `.play()` and may throw errors
  // if one tries to execute another `.play()` or `.pause()` while that
  // promise is resolving. So we prevent that with this lock.
  // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
  let lockPlay = useRef<boolean>(false);

  const handlePlay = useCallback(() => {
    if (lockPlay.current) return;
    const promise = audio.current.play();

    if (promise) {
      lockPlay.current = true;
      promise
        .then(() => {
          setIsPlaying(true);
          onPlay?.();
          lockPlay.current = false;
        })
        .catch(() => {
          lockPlay.current = false;
        });
    } else {
      setIsPlaying(true);
      onPlay?.();
    }
  }, [onPlay]);

  const handlePause = useCallback(() => {
    audio.current.pause();
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleStop = useCallback(() => {
    audio.current.pause();
    audio.current.currentTime = 0;
    setTime(0);
    setIsPlaying(false);
  }, []);

  const handleSetVolume = useCallback((volume: number) => {
    audio.current.volume = volume;
    setVolume(volume);
  }, []);

  const handleSeek = useCallback(
    (time: number) => {
      setTime(time);
      onSeeking?.();
      audio.current.currentTime = time;
    },
    [onSeeking],
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePlay, handlePause]);

  const handleToggleLoop = useCallback(() => {
    audio.current.loop = !audio.current.loop;
    setLoop(audio.current.loop);
  }, []);

  return {
    volume,
    currentTime: time,
    loop,
    isPlaying,
    togglePlay: handleTogglePlay,
    play: handlePlay,
    pause: handlePause,
    stop: handleStop,
    setVolume: handleSetVolume,
    toggleLoop: handleToggleLoop,
    seek: handleSeek,
  };
}
