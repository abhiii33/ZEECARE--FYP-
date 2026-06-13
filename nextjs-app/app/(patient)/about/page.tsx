import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Award, Users, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

const milestones = [
  { year: "2004", title: "Founded", desc: "ZeeCare started as a small clinic with a vision of accessible healthcare." },
  { year: "2010", title: "Expansion", desc: "Expanded to 5 departments with over 50 medical professionals." },
  { year: "2016", title: "Digital Transformation", desc: "Launched our digital appointment and records management system." },
  { year: "2020", title: "Telemedicine", desc: "Introduced telemedicine services during the pandemic, serving 10,000+ patients." },
  { year: "2024", title: "AI Integration", desc: "Integrated AI-powered diagnostics and patient care optimization." },
];

const values = [
  { icon: Heart, title: "Compassionate Care", desc: "We treat every patient with empathy, dignity, and respect." },
  { icon: Shield, title: "Safety First", desc: "Patient safety is our highest priority in every decision we make." },
  { icon: Award, title: "Excellence", desc: "We continuously strive for the highest standards in medical care." },
  { icon: Users, title: "Collaboration", desc: "Our multidisciplinary team works together for the best outcomes." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4">Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Dedicated to <span className="text-gradient">Better Healthcare</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            For over 20 years, ZeeCare has been at the forefront of healthcare innovation,
            combining medical excellence with compassionate care to serve our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { value: "50K+", label: "Patients Served" },
              { value: "200+", label: "Doctors" },
              { value: "9", label: "Departments" },
              { value: "20+", label: "Years" },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 border shadow-sm">
                <p className="text-2xl font-bold text-gradient">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            To provide accessible, high-quality healthcare to every individual, leveraging
            cutting-edge technology and a dedicated team of medical professionals. We believe
            that quality healthcare is a right, not a privilege.
          </p>
          <Separator className="my-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <Card className="flex-1 mb-2 card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary">{m.year}</Badge>
                      <h3 className="font-semibold">{m.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="py-16 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Awards & Accreditations</h2>
          <p className="text-muted-foreground mb-10">Recognized for excellence in healthcare delivery</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {["JCI Accredited", "ISO 9001:2015", "Best Hospital 2023", "5-Star Rating"].map((award) => (
              <div key={award} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl p-4 border">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-2 fill-current" />
                <p className="text-sm font-semibold">{award}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of patients who trust ZeeCare for their health management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="bg-white text-purple-600 hover:bg-white/90" asChild>
              <Link href="/appointment">
                Book an Appointment <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/doctors">Meet Our Doctors</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
