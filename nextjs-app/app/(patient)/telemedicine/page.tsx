import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Clock, Star, Calendar, Wifi, Shield, Smartphone } from "lucide-react";
import Link from "next/link";

const onlineDoctors = [
  { name: "Dr. Sarah Johnson", dept: "Cardiology", rating: 4.9, price: "$45", available: true, initials: "SJ" },
  { name: "Dr. Michael Chen", dept: "Neurology", rating: 4.8, price: "$55", available: true, initials: "MC" },
  { name: "Dr. Emily Davis", dept: "Dermatology", rating: 4.7, price: "$40", available: false, initials: "ED" },
  { name: "Dr. James Lee", dept: "Pediatrics", rating: 4.9, price: "$35", available: true, initials: "JL" },
];

const features = [
  { icon: Wifi, title: "HD Video Calls", desc: "Crystal-clear video consultations from any device" },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encrypted, HIPAA compliant sessions" },
  { icon: Clock, title: "On-Demand", desc: "Connect with available doctors within minutes" },
  { icon: Smartphone, title: "Any Device", desc: "Works on mobile, tablet, or desktop browsers" },
];

export default function TelemedicinePage() {
  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="container">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">Virtual Care</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Telemedicine Consultations</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Consult with board-certified doctors from the comfort of your home. Get prescriptions,
            lab orders, and specialist referrals — all online.
          </p>
          <Button variant="gradient" size="xl" asChild>
            <Link href="/appointment">
              <Video className="mr-2 h-5 w-5" />Book a Video Consultation
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((f) => (
            <Card key={f.title} className="text-center card-hover">
              <CardContent className="p-5">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Doctors */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {onlineDoctors.map((doc) => (
              <Card key={doc.name} className="card-hover">
                <CardHeader className="text-center pb-3">
                  <div className="relative mx-auto mb-2">
                    <Avatar className="h-16 w-16 mx-auto">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {doc.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                        doc.available ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-base">{doc.name}</CardTitle>
                  <CardDescription>{doc.dept}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{doc.rating}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{doc.price}/session</span>
                  </div>
                  <Badge
                    variant={doc.available ? "success" : "secondary"}
                    className="w-full justify-center text-xs"
                  >
                    {doc.available ? "Available Now" : "Unavailable"}
                  </Badge>
                  <Button
                    variant={doc.available ? "gradient" : "outline"}
                    size="sm"
                    className="w-full"
                    disabled={!doc.available}
                    asChild={doc.available}
                  >
                    {doc.available ? (
                      <Link href="/appointment">
                        <Video className="mr-2 h-3.5 w-3.5" />Connect
                      </Link>
                    ) : (
                      <span><Calendar className="mr-2 h-3.5 w-3.5" />Schedule</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Choose a Doctor", desc: "Browse available specialists online" },
              { step: "2", title: "Book a Session", desc: "Select your preferred time slot" },
              { step: "3", title: "Join Video Call", desc: "Connect via secure video link" },
              { step: "4", title: "Get Treatment", desc: "Receive prescription & follow-up plan" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
