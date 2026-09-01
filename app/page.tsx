import PublicHeader from "@/components/layout/PublicHeader";
import Hero from "@/components/home/Hero";
import EventTypes from "@/components/home/EventTypes";
import Packages from "@/components/home/Packages";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import GalleryPreview from "@/components/home/GalleryPreview";
import Reviews from "@/components/home/Reviews";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main>
        <Hero />
        <EventTypes />
        <Packages />
        <HowItWorks />
        <WhyChooseUs />
        <GalleryPreview />
        <Reviews />
        <CTA />
      </main>

      <Footer />
    </>
  );
}