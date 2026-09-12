import Link from "next/link";

export default function HomePage() {
  return (
    <main className="h-screen overflow-hidden bg-[#0b0b0a]">
      <section
        className="relative h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/event-hero.jpg')",
        }}
      >
        <Link
          href="/login"
          className="absolute bottom-6 right-6 z-10 inline-flex min-h-14 items-center justify-center rounded-full bg-[#d2b47a] px-10 text-sm font-semibold text-[#17130d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e0c58f] hover:shadow-xl"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}