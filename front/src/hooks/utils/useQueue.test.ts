import { act, renderHook } from "@testing-library/react-hooks";
import useLifoQueue from "./useLifoQueue"; // Import your hook

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

    expect(result.current.pop()).toBe("C");
    expect(result.current.pop()).toBe("B");
    expect(result.current.pop()).toBe("A");
    expect(result.current.pop()).toBe(null); // Check for null when empty
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

    const poppedValues = [
      result.current.pop(),
      result.current.pop(),
      result.current.pop(),
    ];
    expect(poppedValues).toEqual([4, 3, 2]);
  });

  // Add more tests to cover edge cases, error handling, etc.
  // For example, test pushing to a full queue (with maxSize), or popping from an empty queue.
});
