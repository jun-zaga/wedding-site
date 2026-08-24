import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { DetailsSection, FaqSection, Footer, GallerySection, IntroSection, RegistrySection, ScheduleSection, StorySection } from "./components/Sections";
import { RsvpSection } from "./components/RsvpSection";
import { WEDDING_DATE } from "./data/wedding";

function App() {
  const daysAway = Math.max(0, Math.ceil((WEDDING_DATE.getTime() - Date.now()) / 86_400_000));
  return <main>
    <Navbar />
    <Hero daysAway={daysAway} />
    <IntroSection />
    <StorySection />
    <DetailsSection />
    <ScheduleSection />
    <GallerySection />
    <RegistrySection />
    <RsvpSection />
    <FaqSection />
    <Footer />
  </main>;
}

export default App;
