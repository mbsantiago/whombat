import { useState, useEffect, useRef } from "react";

const DEFAULT_TIMEOUT = 20_000;

export interface ImageStatus {
  element: HTMLImageElement;
  url: string;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export interface UseImageConfig {
  timeout?: number | null;
}

export default function useImage(
  url: string,
  { timeout = DEFAULT_TIMEOUT }: UseImageConfig = {},
): ImageStatus {
  const ref = useRef(new Image());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const image = ref.current;
    image.src = url;

    setLoading(true);
    setError(null);

    const handleOnLoad = () => setLoading(false);
    const handleOnError = () => setError("Unknown error");

    image.addEventListener("load", handleOnLoad, false);
    image.addEventListener("error", handleOnError, false);

    // Fail if load is longer than the provided timeout
    let timer: ReturnType<typeof setTimeout> | null;

    if (timeout != null) {
      timer = setTimeout(() => {
        if (!image.complete || !image.naturalWidth) {
          setError("Took too long to load");
          setLoading(false);
        }
      }, timeout);
    }

    return () => {
      // Remove all event listeners and timeouts
      image.removeEventListener("load", handleOnLoad);
      image.removeEventListener("error", handleOnError);

      if (timer != null) {
        clearTimeout(timer);
      }
    };
  }, [url, timeout]);

  return {
    url,
    element: ref.current,
    isLoading: loading,
    isError: error != null,
    error,
  };
}
