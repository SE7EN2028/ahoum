import Hero from "../components/Hero";
import About from "../components/About";
import Sessions from "../components/Sessions";
import Practices from "../components/Practices";
import CalmCTA from "../components/CalmCTA";
import Stories from "../components/Stories";
import Faq from "../components/Faq";
import BeginCTA from "../components/BeginCTA";
import Footer from "../components/Footer";
import Overlays from "../components/Overlays";

export default function Home() {
  return (
    <div id="top">
      <Hero />
      <About />
      <Sessions />
      <Practices />
      <CalmCTA />
      <Stories />
      <Faq />
      <BeginCTA />
      <Footer />
      <Overlays />
    </div>
  );
}
