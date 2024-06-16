import { renderHook, act } from "@testing-library/react";

import useViewport from "@/hooks/window/useWindow";
import type { SpectrogramWindow } from "@/types";

describe("useViewport hook", () => {
  const initialViewport: SpectrogramWindow = {
    time: { min: 0, max: 10 },
    freq: { min: 0, max: 100 },
  };
  const bounds: SpectrogramWindow = {
    time: { min: -100, max: 100 },
    freq: { min: -500, max: 500 },
  };

  test("initializes with correct values", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    expect(result.current.viewport).toEqual(initialViewport);
    expect(result.current.bounds).toEqual(bounds);
  });

  test("updates viewport with 'set'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    const newViewport = {
      time: { min: 5, max: 15 },
      freq: { min: 50, max: 150 },
    };
    act(() => result.current.set(newViewport));
    expect(result.current.viewport).toEqual(newViewport);
  });

  test("correctly adjust to viewport bounds", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() =>
      result.current.set({
        time: { min: -101, max: 0 },
        freq: { min: 0, max: 501 },
      }),
    );
    expect(result.current.viewport).toEqual({
      time: { min: -100, max: 1 },
      freq: { min: -1, max: 500 },
    });
  });

  test("scales viewport with 'scale'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.scale({ time: 2, freq: 0.5 }));
    expect(result.current.viewport).toEqual({
      time: { min: -5, max: 15 },
      freq: { min: 25, max: 75 },
    });
  });

  test("calls onChange callback on viewport change", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds, onChange }),
    );
    const newViewport = {
      time: { min: 5, max: 15 },
      freq: { min: 50, max: 150 },
    };
    act(() => result.current.set(newViewport));
    expect(onChange).toHaveBeenCalledWith(newViewport);
  });

  test("handles edge cases (e.g., back when history is empty)", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.back());
    expect(result.current.viewport).toEqual(initialViewport);
  });
});
