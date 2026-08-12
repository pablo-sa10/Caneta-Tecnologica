import { Hero } from "@/components/sections/Hero";
import { NextFold } from "@/components/sections/NextFold";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <NextFold />
    </main>
  );
}
