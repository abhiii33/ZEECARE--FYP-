"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText, Activity, Heart, Thermometer, Droplets, Weight,
  Download, Plus, Calendar, TrendingUp,
} from "lucide-react";

const vitals = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: Activity, status: "normal", progress: 70 },
  { label: "Heart Rate", value: "72", unit: "bpm", icon: Heart, status: "normal", progress: 60 },
  { label: "Temperature", value: "98.6", unit: "°F", icon: Thermometer, status: "normal", progress: 65 },
  { label: "Blood Sugar", value: "95", unit: "mg/dL", icon: Droplets, status: "normal", progress: 55 },
  { label: "Weight", value: "70", unit: "kg", icon: Weight, status: "healthy", progress: 72 },
  { label: "SpO2", value: "98", unit: "%", icon: TrendingUp, status: "normal", progress: 98 },
];

const records = [
  { date: "2024-05-15", type: "Lab Report", desc: "Complete Blood Count (CBC)", doctor: "Dr. Sarah Johnson", dept: "Cardiology" },
  { date: "2024-04-20", type: "Prescription", desc: "Hypertension medication prescription", doctor: "Dr. James Lee", dept: "Cardiology" },
  { date: "2024-03-10", type: "Radiology", desc: "Chest X-Ray report", doctor: "Dr. Emily Davis", dept: "Radiology" },
  { date: "2024-02-05", type: "Consultation", desc: "Annual wellness checkup", doctor: "Dr. Michael Chen", dept: "Pediatrics" },
];

const medications = [
  { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", remaining: 15, total: 30 },
  { name: "Metformin", dosage: "500mg", frequency: "Twice daily", remaining: 8, total: 30 },
  { name: "Atorvastatin", dosage: "20mg", frequency: "Once nightly", remaining: 22, total: 30 },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "Lab Report": return "info";
    case "Prescription": return "success";
    case "Radiology": return "warning";
    default: return "secondary";
  }
};

export default function HealthRecordsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="py-8 bg-muted/30 min-h-screen">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Health Records</h1>
            <p className="text-muted-foreground text-sm">Your complete medical history and health metrics</p>
          </div>
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />Add Record
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {vitals.map((v) => (
                <Card key={v.label} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <v.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="success" className="text-xs">{v.status}</Badge>
                    </div>
                    <p className="text-2xl font-bold">{v.value}</p>
                    <p className="text-xs text-muted-foreground mb-2">{v.label} ({v.unit})</p>
                    <Progress value={v.progress} className="h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{r.desc}</p>
                        <p className="text-xs text-muted-foreground">{r.doctor} • {r.date}</p>
                      </div>
                      <Badge variant={getTypeColor(r.type) as "info" | "success" | "warning" | "secondary"} className="text-xs shrink-0">
                        {r.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/30 transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{r.desc}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{r.date}
                          </span>
                          <span className="text-xs text-muted-foreground">{r.doctor}</span>
                          <span className="text-xs text-muted-foreground">{r.dept}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeColor(r.type) as "info" | "success" | "warning" | "secondary"} className="text-xs">
                          {r.type}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <div className="grid gap-4">
              {medications.map((med, i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{med.name}</h3>
                        <p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p>
                      </div>
                      <Badge
                        variant={med.remaining < 10 ? "destructive" : "success"}
                        className="text-xs"
                      >
                        {med.remaining} left
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Supply remaining</span>
                        <span>{med.remaining}/{med.total} days</span>
                      </div>
                      <Progress value={(med.remaining / med.total) * 100} className="h-2" />
                    </div>
                    {med.remaining < 10 && (
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        Request Refill
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
