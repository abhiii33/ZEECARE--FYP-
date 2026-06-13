import Hero from "@/components/home/Hero";
import Departments from "@/components/home/Departments";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import ContactForm from "@/components/home/ContactForm";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Departments />
        <Features />
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
