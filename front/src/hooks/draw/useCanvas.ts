import { RefObject, useCallback, useEffect, useState } from "react";
import { useEvent, useMount } from "react-use";

export type DrawFunction = (ctx: CanvasRenderingContext2D) => void;

export default function useCanvas({
  ref,
  draw,
  onMount,
  onResize,
  onDraw,
  onClear,
  onError,
}: {
  ref: RefObject<HTMLCanvasElement>;
  draw: DrawFunction;
  onMount?: (ctx: CanvasRenderingContext2D) => void;
  onResize?: (ctx: CanvasRenderingContext2D) => void;
  onDraw?: (ctx: CanvasRenderingContext2D) => void;
  onClear?: (ctx: CanvasRenderingContext2D) => void;
  onError?: (canvas: HTMLCanvasElement) => void;
}): RefObject<HTMLCanvasElement> {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas context
  useMount(() => {
    const { current: canvas } = ref;

    // If the canvas is not mounted yet, do nothing
    if (canvas == null) return;

    // Sync the canvas size attributes with the parent element size
    // This is particularly useful if the canvas is meant to fill the parent
    // element
    canvas.width = canvas.parentElement?.offsetWidth ?? canvas.offsetWidth;
    canvas.height = canvas.parentElement?.offsetHeight ?? canvas.offsetHeight;

    // Get the drawing context
    const context = canvas.getContext("2d");

    // If the context is not supported, display an error
    if (context == null) {
      canvas.classList.add("border-2", "border-red-500");
      onError?.(canvas);
      return;
    }

    context.imageSmoothingEnabled = false;

    setCtx(context);
    onMount?.(context);
  });

  const handleOnResize = useCallback(() => {
    const { current: canvas } = ref;
    if (canvas != null && ctx != null) {
      canvas.width = canvas.parentElement?.offsetWidth ?? canvas.offsetWidth;
      canvas.height = canvas.parentElement?.offsetHeight ?? canvas.offsetHeight;

      draw(ctx);
      onResize?.(ctx);
    }
  }, [ref, ctx, draw, onResize]);

  // Resize canvas on window resize
  useEvent("resize", handleOnResize, window);

  // Draw whenever the draw function changes
  // And clean up the canvas when the component unmounts
  useEffect(() => {
    if (ctx != null) {
      draw(ctx);
      onDraw?.(ctx);
      return () => {
        const { canvas } = ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onClear?.(ctx);
      };
    }
  }, [ctx, draw, onDraw, onClear]);

  // Prevent scrolling when the mouse is over the canvas
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!ref.current?.contains(target)) return;
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [ref]);

  return ref;
}
