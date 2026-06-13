import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    text: "ZeeCare transformed my healthcare experience. Booking appointments is seamless and the doctors are incredibly professional and caring.",
    initials: "SJ",
    dept: "Cardiology",
  },
  {
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    text: "The telemedicine feature is a game-changer. I consulted with a specialist from home and got my prescription the same day. Highly recommend!",
    initials: "MC",
    dept: "Neurology",
  },
  {
    name: "Emma Williams",
    role: "Patient",
    rating: 5,
    text: "My digital health records are always accessible and up-to-date. The entire team at ZeeCare genuinely cares about patient wellbeing.",
    initials: "EW",
    dept: "Dermatology",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Patients Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Thousands of patients trust ZeeCare for their healthcare needs. Here&apos;s what they have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="card-hover relative overflow-hidden">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.dept} Department</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
