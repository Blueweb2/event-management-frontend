import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="h-dvh overflow-hidden bg-[#0b0b0a]">
      <section
        className="relative flex h-full items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/home-bg.jpeg')",
        }}
      >
        {/* Logo */}
        <div className="absolute left-1/2 top-8 z-10 -translate-x-1/2 sm:top-10">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/90 p-3 shadow-xl sm:h-36 sm:w-36">
            <Image
              src="/images/logo.svg"
              alt="Event Management"
              width={140}
              height={140}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Get Started */}
        <Link
          href="/login"
          className="absolute bottom-8 left-1/2 z-10 inline-flex min-h-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#d2b47a] px-10 text-sm font-semibold text-[#17130d] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e0c58f] hover:shadow-xl"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
};