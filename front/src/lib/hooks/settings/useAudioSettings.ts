import type { AudioSettings, Recording } from "@/lib/types";
import { produce } from "immer";
import { useMemo } from "react";
import { useImmerReducer } from "use-immer";

/**
 * A React hook for managing and updating audio settings.
 */
export default function useAudioSettings({
  initialSettings,
}: {
  /** The initial audio settings. */
  initialSettings: AudioSettings;
}) {
  const reducer = useMemo(
    () => createAudioSettingsReducer(initialSettings),
    [initialSettings],
  );
  const [settings, dispatch] = useImmerReducer(reducer, initialSettings);
  return {
    settings,
    dispatch,
  };
}

export type AudioSettingsAction =
  | { type: "setAll"; settings: AudioSettings }
  | { type: "setSpeed"; speed: number }
  | { type: "setSamplerate"; samplerate: number }
  | {
      type: "setFilter";
      filter: { lowFreq?: number; highFreq?: number; order?: number };
    }
  | { type: "setChannel"; channel: number }
  | { type: "toggleResample" }
  | { type: "adjustToRecording"; recording: Recording }
  | { type: "reset" };

function createAudioSettingsReducer(initialSettings: AudioSettings) {
  return function audioSettingsReducer(
    draft: AudioSettings,
    action: AudioSettingsAction,
  ) {
    switch (action.type) {
      case "setAll": {
        return action.settings;
      }
      case "setSpeed": {
        updateSpeed(draft, action.speed);
        break;
      }
      case "setSamplerate": {
        updateSamplerate(draft, action.samplerate);
        break;
      }
      case "setFilter": {
        updateFilter(draft, action.filter);
        break;
      }
      case "setChannel": {
        updateChannel(draft, action.channel);
        break;
      }
      case "toggleResample": {
        draft.resample = !draft.resample;
        break;
      }
      case "adjustToRecording": {
        adjustToRecordingRecipe(draft, action.recording);
        break;
      }
      case "reset": {
        return initialSettings;
      }
    }
  };
}

function adjustToRecordingRecipe(draft: AudioSettings, recording: Recording) {
  if (draft.samplerate == null) {
    draft.samplerate = recording.samplerate;
  }

  const samplerate = draft.resample ? draft.samplerate : recording.samplerate;

  // Make sure the low frequency is less than half the sample rate
  if (draft.low_freq != null) {
    draft.low_freq = Math.min(draft.low_freq, samplerate / 2);
  }

  // Make sure the high frequency is less than half the sample rate
  if (draft.high_freq != null) {
    draft.high_freq = Math.min(draft.high_freq, samplerate / 2);
  }

  // Make sure the high frequency is greater than the low frequency
  if (draft.low_freq != null && draft.high_freq != null) {
    if (draft.low_freq > draft.high_freq) {
      draft.high_freq = draft.low_freq;
    }
  }

  // Make sure the speed is within the valid range
  const speedOptions = getSpeedOptions(samplerate);

  if (!speedOptions.some((option) => option.value === draft.speed)) {
    draft.speed = getDefaultSpeedOption(speedOptions).value;
  }
}

function updateChannel(draft: AudioSettings, channel: number) {
  if (channel < 0) {
    throw new Error("Channel must be greater than 0");
  }
  draft.channel = channel;
}

function updateFilter(
  draft: AudioSettings,
  {
    lowFreq,
    highFreq,
    order = 4,
  }: {
    lowFreq?: number | null;
    highFreq?: number | null;
    order?: number;
  },
) {
  if (lowFreq !== undefined) {
    if (lowFreq != null && lowFreq < 0) {
      throw new Error("Low frequency must be greater than 0");
    }

    if (
      lowFreq != null &&
      draft.resample &&
      draft.samplerate != null &&
      lowFreq > draft.samplerate / 2
    ) {
      throw new Error("Low frequency must be less than half the sample rate");
    }
    draft.low_freq = lowFreq;
  }

  if (highFreq !== undefined) {
    if (highFreq != null && highFreq < 0) {
      throw new Error("High frequency must be greater than 0");
    }

    if (
      highFreq != null &&
      draft.resample &&
      draft.samplerate != null &&
      highFreq > draft.samplerate / 2
    ) {
      throw new Error("High frequency must be less than half the sample rate");
    }

    if (
      highFreq != null &&
      draft.low_freq != null &&
      highFreq < draft.low_freq
    ) {
      throw new Error("High frequency must be greater than low frequency");
    }

    draft.high_freq = highFreq;
  }

  if (order != null) {
    if (order <= 0) {
      throw new Error("Filter order must be greater than 0");
    }

    draft.filter_order = order;
  }
}

function updateSamplerate(draft: AudioSettings, samplerate: number) {
  if (samplerate <= 0) {
    throw new Error("Sample rate must be greater than 0");
  }
  draft.samplerate = samplerate;
}

function updateSpeed(draft: AudioSettings, speed: number) {
  if (speed <= 0) {
    throw new Error("Speed must be greater than 0");
  }
  draft.speed = speed;
}

export type SpeedOption = {
  label: string;
  value: number;
};

const LOWEST_PLAYBACK_SAMPLERATE = 8000;
const HIGHTEST_PLAYBACK_SAMPLERATE = 96000;
const ALL_SPEED_OPTIONS: SpeedOption[] = [
  { label: "1x", value: 1 },
  { label: "1.2x", value: 1.2 },
  { label: "1.5x", value: 1.5 },
  { label: "1.75x", value: 1.75 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "0.75x", value: 0.75 },
  { label: "0.5x", value: 0.5 },
  { label: "0.25x", value: 0.25 },
  { label: "0.1x", value: 0.1 },
];

export type AudioSettingsInterface = {
  settings: AudioSettings;
  dispatch: (action: AudioSettingsAction) => void;
};

export function getSpeedOptions(samplerate: number): SpeedOption[] {
  return ALL_SPEED_OPTIONS.filter((option) => {
    const speed = option.value;
    const newSampleRate = samplerate * speed;
    return (
      newSampleRate >= LOWEST_PLAYBACK_SAMPLERATE &&
      newSampleRate <= HIGHTEST_PLAYBACK_SAMPLERATE
    );
  });
}

export function getDefaultSpeedOption(options: SpeedOption[]): SpeedOption {
  return options.find((option) => option.value === 1) || options[0];
}

export function adjustToRecording(
  settings: AudioSettings,
  recording: Recording,
) {
  return produce(settings, (draft) =>
    adjustToRecordingRecipe(draft, recording),
  );
}
