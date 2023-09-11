/**Hook to handle spectrogram parameters.
 *
 * This loads the initial parameters from the global state, and allows
 * the user to change them. The parameters are validated before being
 * saved to the global state.
 *
 * Use this hook to store and manage the state of the spectrogram parameters.
 * The hook returns an object with the following properties:
 *
 * - `parameters`: The current parameters.
 * - `set`: A function to set a parameter.
 * - `clear`: A function to clear a parameter.
 * - `update`: A function to force an update of the global state.
 *
 */
import { useState, useCallback, useMemo } from "react";
import useStore from "@/store";
import { useDebounce } from "react-use";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";

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

export default function useSpectrogramParameters({
  recording,
}: {
  recording?: Recording;
}) {
  const initial = useStore((state) => state.spectrogramSettings);
  const set = useStore((state) => state.setSpectrogramSettings);

  // Intermediate state to allow for local changes before saving to global
  // state.
  let [parameters, setParameters] = useState<SpectrogramParameters>(initial);

  // Debounce changes to the global state.
  useDebounce(() => set(parameters), 200, [parameters]);

  // Update the local state one key at a time.
  let setValue = useCallback(
    (key: keyof SpectrogramParameters, value: any) => {
      setParameters((state) =>
        validateParameters({
          parameters: { ...state, [key]: value },
          recording,
        }),
      );
    },
    [recording],
  );

  // Clear a key
  let clearValue = useCallback(
    (key: keyof SpectrogramParameters) => {
      setParameters((state) => {
        const { [key]: _, ...rest } = state;
        return validateParameters({ parameters: rest, recording });
      });
    },
    [recording],
  );

  const validatedParameters = useMemo(() => {
    return validateParameters({ parameters, recording });
  }, [parameters, recording]);

  return {
    // Use this to read the current state.
    parameters: validatedParameters,
    // Use this to set a key in the local state
    set: setValue,
    // Use this to clear a key from the local state
    clear: clearValue,
    // Use this to force an update of the global state.
    update: () => set(parameters),
  };
}
