import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Baby, Bone, Heart, Brain, Zap, Eye, Activity, Ear, Microscope } from "lucide-react";

const departments = [
  { name: "Pediatrics", icon: Baby, desc: "Expert care for children from birth to adolescence", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { name: "Orthopedics", icon: Bone, desc: "Advanced bone, joint, and muscle treatments", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { name: "Cardiology", icon: Heart, desc: "Comprehensive heart and vascular care", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  { name: "Neurology", icon: Brain, desc: "Expert care for brain and nervous system", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
  { name: "Oncology", icon: Zap, desc: "Cutting-edge cancer diagnosis and treatment", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  { name: "Radiology", icon: Eye, desc: "Advanced medical imaging and diagnostics", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { name: "Physical Therapy", icon: Activity, desc: "Rehabilitation and physical wellness", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
  { name: "Dermatology", icon: Microscope, desc: "Skin, hair, and nail care specialists", color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { name: "ENT", icon: Ear, desc: "Ear, nose, and throat specialists", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
];

export default function Departments() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Specializations</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Medical Departments</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our hospital offers a comprehensive range of medical specialties with state-of-the-art
            facilities and experienced specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.name} className="card-hover cursor-pointer group">
              <CardContent className="p-6 flex items-start gap-4">
                <div className={`${dept.bg} p-3 rounded-xl shrink-0`}>
                  <dept.icon className={`h-6 w-6 ${dept.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{dept.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link href="/departments">
              View All Departments <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
