import Header from "@/components/Header";
import { H1 } from "@/components/Headings";

export default function Hero({ text }: { text: string }) {
  return (
    <Header>
      <H1>{text}</H1>
    </Header>
  );
}
