import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Baby, Bone, Heart, Brain, Zap, Eye, Activity, Microscope, Ear, Calendar } from "lucide-react";

const departments = [
  {
    name: "Pediatrics",
    icon: Baby,
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    desc: "Comprehensive healthcare for infants, children, and adolescents. Our pediatric specialists provide preventive care, diagnose illnesses, and treat acute and chronic conditions.",
    services: ["Well-child visits", "Immunizations", "Developmental screening", "Sick visits"],
    doctors: 8,
  },
  {
    name: "Orthopedics",
    icon: Bone,
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    desc: "Advanced treatment for musculoskeletal conditions including bones, joints, ligaments, tendons, muscles, and nerves using cutting-edge surgical and non-surgical methods.",
    services: ["Joint replacement", "Sports medicine", "Spine surgery", "Fracture care"],
    doctors: 12,
  },
  {
    name: "Cardiology",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    desc: "Comprehensive cardiac care from preventive cardiology to complex interventional procedures. Our team uses the latest diagnostic technology for heart health.",
    services: ["ECG & Echo", "Cardiac catheterization", "Heart failure management", "Arrhythmia treatment"],
    doctors: 15,
  },
  {
    name: "Neurology",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    desc: "Expert diagnosis and treatment of disorders of the nervous system, including the brain, spinal cord, and peripheral nerves.",
    services: ["Stroke care", "Epilepsy management", "Headache treatment", "Memory disorders"],
    doctors: 10,
  },
  {
    name: "Oncology",
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    desc: "Comprehensive cancer care including diagnosis, treatment planning, surgery, chemotherapy, radiation, and support services with a multidisciplinary approach.",
    services: ["Cancer screening", "Chemotherapy", "Radiation therapy", "Immunotherapy"],
    doctors: 9,
  },
  {
    name: "Radiology",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    desc: "State-of-the-art medical imaging using X-ray, CT scan, MRI, and ultrasound technologies to aid in diagnosis and guide minimally invasive procedures.",
    services: ["X-Ray & MRI", "CT Scanning", "Ultrasound", "Interventional radiology"],
    doctors: 7,
  },
  {
    name: "Physical Therapy",
    icon: Activity,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    desc: "Evidence-based physical rehabilitation to restore movement and function, reduce pain, and prevent future injury through personalized treatment plans.",
    services: ["Post-surgery rehab", "Sports injury", "Pain management", "Balance training"],
    doctors: 11,
  },
  {
    name: "Dermatology",
    icon: Microscope,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    desc: "Complete care for skin, hair, and nail conditions with advanced dermatological treatments including cosmetic and medical dermatology.",
    services: ["Acne treatment", "Skin cancer", "Cosmetic procedures", "Psoriasis care"],
    doctors: 6,
  },
  {
    name: "ENT",
    icon: Ear,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    desc: "Specialized care for disorders of the ear, nose, and throat including hearing loss, sinus problems, voice disorders, and head & neck conditions.",
    services: ["Hearing tests", "Sinus surgery", "Thyroid care", "Sleep apnea"],
    doctors: 5,
  },
];

export default function DepartmentsPage() {
  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">Specializations</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Medical Departments</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer a comprehensive range of medical specialties staffed by world-class physicians
            and supported by the latest technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.name} className="card-hover">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`${dept.bg} p-3 rounded-xl shrink-0`}>
                    <dept.icon className={`h-7 w-7 ${dept.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{dept.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {dept.doctors} Specialists
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {dept.desc}
                </CardDescription>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.services.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full group" asChild>
                  <Link href={`/appointment?dept=${dept.name}`}>
                    <Calendar className="mr-2 h-3.5 w-3.5" />
                    Book Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
