import Header from "@/lib/components/ui/Header";
import { H1 } from "@/lib/components/ui/Headings";

/**
 * A Hero component for displaying large, visually impactful text content.
 *
 * This component is a simplified version of the `Header` component, designed
 * specifically for cases where you need a single prominent heading (H1)
 * without the complexity of additional children. It leverages the styling and
 * layout of the `Header` component to create a visually distinct section at
 * the top of a page or section.
 */
export default function Hero({
  text,
}: {
  /** The text content to be displayed within the H1 heading. */
  text: string;
}) {
  return (
    <Header>
      <H1>{text}</H1>
    </Header>
  );
}
