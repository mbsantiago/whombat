/**
 * @module useImage
 * A React hook for managing the loading state, errors, and timeouts of an
 * image.
 */
import { type RefObject, useEffect, useRef, useState } from "react";

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30_000;

export type ImageStatus = {
  /** The image element reference. */
  image: RefObject<HTMLImageElement>;
  /** Indicates if the image is currently loading. */
  isLoading: boolean;
  /** The error object if an error occurred, otherwise null. */
  error: Error | null;
};

/**
 * A custom React hook to manage image loading.
 */
export default function useImage({
  url,
  timeout = DEFAULT_TIMEOUT,
  onLoad,
  onError,
  onTimeout,
}: {
  /** The URL of the image to load. */
  url: string;
  /** Optional timeout (in milliseconds) for image loading. Defaults to 30
   * seconds. */
  timeout?: number;
  /** Optional callback function to be executed when the image is loaded
   * successfully. */
  onLoad?: () => void;
  /** Optional callback function to be executed if an error occurs during image
   * loading. Receives the error object as an argument. */
  onError?: (e: Error) => void;
  /** Optional callback function to be executed if the image loading times out.
   * */
  onTimeout?: () => void;
}): ImageStatus {
  const image = useRef<HTMLImageElement>(new Image());
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const { current } = image;
    let timer: ReturnType<typeof setTimeout> | null = null;

    current.src = url;
    setLoading(true);
    setError(null);

    const handleLoad = () => {
      setLoading(false);
      if (timer) clearTimeout(timer);
      onLoad?.();
    };

    const handleError = () => {
      setLoading(false);
      const error = new Error("Error loading image");
      setError(error);
      if (timer) clearTimeout(timer);
      onError?.(error);
    };

    timer = setTimeout(() => {
      setLoading(false);
      setError(new Error("Image loading timed out"));
      onTimeout?.();
    }, timeout);

    current.addEventListener("load", handleLoad);
    current.addEventListener("error", handleError);

    return () => {
      current.removeEventListener("load", handleLoad);
      current.removeEventListener("error", handleError);
      if (timer) clearTimeout(timer);
    };
  }, [url, timeout, onTimeout, onError, onLoad]);

  return {
    image,
    isLoading,
    error,
  };
}
