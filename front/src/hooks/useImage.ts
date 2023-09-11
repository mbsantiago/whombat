/** Hook to load an image and get its status
 *
 * This hook uses the browser's Image API to load an image and get its status.
 * This enables the browser to cache the image and avoid reloading it when it
 * is used multiple times.
 *
 * The hook exposes the image element, its loading status, and any error that
 * occurred.
 *
 * A timeout can be provided to fail if the image takes too long to load.
 *
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useEvent, useTimeoutFn, useUnmount } from "react-use";

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30_000;

export type ImageStatus = {
  image: HTMLImageElement;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  url: string;
};

export default function useImage({
  url,
  timeout = DEFAULT_TIMEOUT,
  onLoad,
  onError,
  onTimeout,
}: {
  url: string;
  timeout?: number;
  onLoad?: () => void;
  onError?: () => void;
  onTimeout?: () => void;
}): ImageStatus {
  const ref = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  if (ref.current === null) {
    // @ts-ignore
    ref.current = new Image();
  }

  // Update the image when the url changes
  useEffect(() => {
    if (ref.current != null) {
      ref.current.src = url;
      setLoading(true);
      setError(null);
    }
  }, [url]);

  // Timeout loading after a given time
  const handleOnTimeout = useCallback(() => {
    setError("Took too long to load");
    setLoading(false);
    onTimeout?.();
  }, [url, onTimeout]);

  const [_, cancel] = useTimeoutFn(handleOnTimeout, timeout);

  // Handle loading events
  const handleOnLoad = useCallback(() => {
    setLoading(false);
    setError(null);
    cancel();
    onLoad?.();
  }, [url, cancel, onLoad]);
  useEvent("load", handleOnLoad, ref.current);

  // Handle error events
  const handleOnError = useCallback(() => {
    setLoading(false);
    setError("Unknown error");
    cancel();
    onError?.();
  }, [url, cancel, onError]);
  useEvent("error", handleOnError, ref.current);

  // Cancel loading on unmount
  useUnmount(() => {
    cancel();
    if (ref.current != null) {
      ref.current.src = "";
    }
  });

  return {
    url,
    image: ref.current,
    isLoading: loading,
    isError: error != null,
    error,
  };
}
