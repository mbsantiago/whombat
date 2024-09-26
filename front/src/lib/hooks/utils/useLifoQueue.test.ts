import { act, renderHook } from "@testing-library/react";

import useLifoQueue from "./useLifoQueue";

describe("useLifoQueue Hook", () => {
  it("should initialize correctly", () => {
    const { result } = renderHook(() => useLifoQueue<string>("initial"));

    expect(result.current.current).toBe("initial");
    expect(result.current.size).toBe(1);
  });

  it("should push items correctly", () => {
    const { result } = renderHook(() => useLifoQueue<number>(null));

    act(() => {
      result.current.push(1);
      result.current.push(2);
      result.current.push(3);
    });

    expect(result.current.current).toBe(3);
    expect(result.current.size).toBe(3);
  });

  it("should pop items in LIFO order", () => {
    const { result } = renderHook(() => useLifoQueue<string>(null));

    act(() => {
      result.current.push("A");
      result.current.push("B");
      result.current.push("C");
    });

    const poppedValues: (string | null)[] = [];

    act(() => {
      poppedValues.push(result.current.pop());
      poppedValues.push(result.current.pop());
      poppedValues.push(result.current.pop());
      poppedValues.push(result.current.pop());
    });

    expect(poppedValues[0]).toBe("C");
    expect(poppedValues[1]).toBe("B");
    expect(poppedValues[2]).toBe("A");
    expect(poppedValues[3]).toBe(null); // Check for null when empty
  });

  it("should clear the queue", () => {
    const { result } = renderHook(() => useLifoQueue<string>("initial"));

    act(() => {
      result.current.push("another");
      result.current.clear();
    });

    expect(result.current.current).toBe(null);
    expect(result.current.size).toBe(0);
  });

  it("should respect maxSize and remove oldest items", () => {
    const { result } = renderHook(() => useLifoQueue<number>(null, 3)); // maxSize = 3

    act(() => {
      result.current.push(1);
      result.current.push(2);
      result.current.push(3);
      result.current.push(4); // Should remove 1
    });

    expect(result.current.current).toBe(4);
    expect(result.current.size).toBe(3);

    const poppedValues: (number | null)[] = [];

    act(() => {
      poppedValues.push(result.current.pop());
      poppedValues.push(result.current.pop());
      poppedValues.push(result.current.pop());
    });

    expect(poppedValues).toEqual([4, 3, 2]);
  });
});
