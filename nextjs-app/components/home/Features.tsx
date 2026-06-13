import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText, Bell, Star, Clock, Shield } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Telemedicine",
    description: "Consult with top doctors from the comfort of your home via secure video calls.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: FileText,
    title: "Digital Health Records",
    description: "Access your complete medical history, prescriptions, and lab results anytime.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get automated appointment reminders and medication alerts via SMS and email.",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  {
    icon: Star,
    title: "Doctor Reviews",
    description: "Read verified patient reviews and ratings to choose the best specialist for you.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  {
    icon: Clock,
    title: "Real-time Booking",
    description: "Book, reschedule, or cancel appointments instantly with real-time availability.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Shield,
    title: "HIPAA Secure",
    description: "Your health data is encrypted and protected with enterprise-grade security.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
];

export default function Features() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Why Choose Us</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Healthcare Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We combine cutting-edge technology with compassionate care to deliver an exceptional
            healthcare experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="card-hover border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
