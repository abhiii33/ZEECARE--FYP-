"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, Shield, Clock, Award } from "lucide-react";

const trustBadges = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Clock, label: "24/7 Available" },
  { icon: Award, label: "Award Winning" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="container relative py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              Trusted Healthcare Provider Since 2004
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Health,{" "}
              <span className="text-gradient">Our Priority</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
              Experience world-class healthcare with our team of 200+ specialists across 9
              departments. Book appointments instantly, access health records securely, and
              consult from anywhere.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="gradient" size="xl" asChild>
                <Link href="/appointment">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/doctors">Meet Our Doctors</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border"
                >
                  <badge.icon className="h-4 w-4 text-purple-600" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "50K+", label: "Happy Patients", color: "from-purple-500 to-purple-700" },
              { value: "200+", label: "Expert Doctors", color: "from-blue-500 to-blue-700" },
              { value: "20+", label: "Years Experience", color: "from-indigo-500 to-indigo-700" },
              { value: "99%", label: "Patient Satisfaction", color: "from-violet-500 to-violet-700" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-hover bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm"
              >
                <div
                  className={`text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-1`}
                >
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
