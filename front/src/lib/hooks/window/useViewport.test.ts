import { act, renderHook } from "@testing-library/react";

import useViewport from "@/lib/hooks/window/useViewport";

import type { SpectrogramWindow } from "@/lib/types";

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

  test("shifts viewport with 'shift'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.shift({ time: 5, freq: -50 }));
    expect(result.current.viewport).toEqual({
      time: { min: 5, max: 15 },
      freq: { min: -50, max: 50 },
    });
  });

  test("zooms into position with 'zoomToPosition'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() =>
      result.current.zoomToPosition({
        position: { time: 10, freq: 100 },
        factor: 0.5,
      }),
    );
    expect(result.current.viewport).toEqual({
      time: { min: 5, max: 10 },
      freq: { min: 50, max: 100 },
    });
  });

  test("sets time interval with 'setTimeInterval'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.setTimeInterval({ min: 5, max: 15 }));
    expect(result.current.viewport.time).toEqual({ min: 5, max: 15 });
  });

  test("sets frequency interval with 'setFrequencyInterval'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.setFrequencyInterval({ min: 50, max: 150 }));
    expect(result.current.viewport.freq).toEqual({ min: 50, max: 150 });
  });

  test("expands viewport with 'expand'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.expand({ time: 10, freq: -10 }));
    expect(result.current.viewport).toEqual({
      time: { min: -10, max: 20 },
      freq: { min: 10, max: 90 },
    });
  });

  test("centers viewport with 'centerOn'", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    act(() => result.current.centerOn({ time: 20, freq: 100 }));
    expect(result.current.viewport).toEqual({
      time: { min: 15, max: 25 },
      freq: { min: 50, max: 150 },
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

  test("can go back to previously saved viewport", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    const newViewport = {
      time: { min: 5, max: 15 },
      freq: { min: 50, max: 150 },
    };
    act(() => result.current.set(newViewport));
    act(() => result.current.save());
    act(() => result.current.set(initialViewport));
    act(() => result.current.back());
    expect(result.current.viewport).toEqual(newViewport);
  });

  test("can reset viewport to initial", () => {
    const { result } = renderHook(() =>
      useViewport({ initial: initialViewport, bounds }),
    );
    const newViewport = {
      time: { min: 5, max: 15 },
      freq: { min: 50, max: 150 },
    };
    act(() => result.current.set(newViewport));
    act(() => result.current.reset());
    expect(result.current.viewport).toEqual(initialViewport);
  });
});
