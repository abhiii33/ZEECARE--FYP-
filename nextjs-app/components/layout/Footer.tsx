import Link from "next/link";
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  services: [
    { label: "Book Appointment", href: "/appointment" },
    { label: "Find Doctors", href: "/doctors" },
    { label: "Departments", href: "/departments" },
    { label: "Telemedicine", href: "/telemedicine" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Health Records", href: "/health-records" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ZeeCare</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Providing world-class healthcare services with compassion and cutting-edge technology
              for over 20 years.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-purple-600 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-purple-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-purple-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-purple-400 shrink-0" />
                <span>123 Healthcare Avenue, Medical District, City 10001</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-purple-400 shrink-0" />
                <span>+1 (800) ZEE-CARE</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-purple-400 shrink-0" />
                <span>contact@zeecare.health</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-xs font-semibold">Emergency: 911</p>
              <p className="text-red-300 text-xs">24/7 Emergency Services Available</p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} ZeeCare Hospital Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-current" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
}
