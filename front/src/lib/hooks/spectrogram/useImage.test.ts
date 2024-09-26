import { act, renderHook } from "@testing-library/react";

import useImage from "./useImage";

describe("useImage hook", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("should initially be in loading state", () => {
    const { result } = renderHook(() => useImage({ url: "test.jpg" }));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test("should set loading to false and call onLoad callback on successful load", async () => {
    const onLoad = jest.fn();
    const { result } = renderHook(() =>
      useImage({ url: "success.jpg", onLoad }),
    );

    act(() => {
      result.current.image.current!.dispatchEvent(new Event("load"));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  test("should set error state and call onError callback on error", async () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useImage({ url: "error.jpg", onError }),
    );

    act(() => {
      result.current.image.current!.dispatchEvent(new Event("error"));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  test("should set timeout error and call onTimeout callback on timeout", async () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() =>
      useImage({ url: "timeout.jpg", timeout: 1000, onTimeout }),
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toBe("Image loading timed out");
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  test("should update image state when URL changes", async () => {
    const { result, rerender } = renderHook(({ url }) => useImage({ url }), {
      initialProps: { url: "initial.jpg" },
    });

    expect(result.current.image.current!.src).toContain("initial.jpg");
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.image.current!.dispatchEvent(new Event("load"));
    });

    rerender({ url: "updated.jpg" });

    expect(result.current.image.current!.src).toContain("updated.jpg");
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.image.current!.dispatchEvent(new Event("load"));
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("should handle cleanup properly when component unmounts", async () => {
    const { unmount } = renderHook(() => useImage({ url: "test.jpg" }));

    act(() => {
      jest.advanceTimersByTime(500);
    });

    unmount();

    act(() => {
      jest.runAllTimers();
    });
  });
});
