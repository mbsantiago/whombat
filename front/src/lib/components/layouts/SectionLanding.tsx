export default function SectionLandingLayout({
  Header,
  Cards,
}: {
  Header: React.ReactNode;
  Cards: React.ReactNode;
}) {
  return (
    <div className="container flex flex-col gap-16 p-16 mx-auto">
      <div className="flex flex-col gap-4">{Header}</div>
      <div className="flex flex-row gap-8 justify-center w-full">{Cards}</div>
    </div>
  );
}
