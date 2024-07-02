"use client";
import Hero from "@/lib/components/Hero";
import Link from "@/lib/components/Link";

export default function Page() {
  return (
    <div>
      <Hero text="Contact" />
      <div className="p-6 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center p-4">
          <span className="font-sans font-bold text-emerald-500 underline decoration-8 text-6xl">
            Contact
          </span>
        </div>
        <div className="max-w-prose text-center flex flex-col items-center gap-8 text-lg">
          <div className="flex flex-col items-center gap-2">
            <span>
              The Whombat team is always delighted to connect with our users.
              Feel free to reach out to us at the following email address for
              any questions, comments, or concerns:
            </span>
            <Link
              mode="text"
              padding="p-0"
              href="mailto:santiago.balvanera.20@ucl.ac.uk"
            >
              santiago.balvanera.20@ucl.ac.uk
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span>
              For development-related inquiries or to explore the source code of
              Whombat, you can find our main code repository on GitHub:
            </span>
            <Link
              mode="text"
              padding="p-0"
              href="https://github.com/mbsantiago/whombat"
            >
              https://github.com/mbsantiago/whombat
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p>
              We value your feedback and suggestions, as they play a crucial
              role in shaping the future of Whombat. Thank you for being a part
              of our community!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
