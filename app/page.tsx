import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Signature } from "@/components/sections/Signature";
import { Technology } from "@/components/sections/Technology";
import { Ticker } from "@/components/sections/Ticker";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Technology />
      <Ticker />
      <Experience />
      <Signature />
    </main>
  );
}
