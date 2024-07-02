import { useEffect } from "react";

/**
 * A React hook that captures the 'wheel' (scroll) event on a specified HTML
 * element, preventing the default scrolling behavior. This can be useful when
 * you want to implement custom scrolling logic or disable scrolling entirely.
 *
 * @example
 * import useCaptureScroll from './useCaptureScroll';
 *
 * function MyComponent() {
 *   const myDivRef = useRef<HTMLDivElement>(null);
 *
 *   useCaptureScroll({ ref: myDivRef });
 *
 *   return <div ref={myDivRef}>Content with captured scroll</div>;
 */
export default function useCaptureScroll<T extends HTMLElement>({
  ref,
}: {
  /** A React ref object  referencing the HTML element on which to capture
   * scroll events.*/
  ref: React.RefObject<T>;
}) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    element.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleScroll);
    };
  }, [ref]);
}
