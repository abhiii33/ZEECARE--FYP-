"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Mail, Phone, Calendar, Shield, MapPin, Heart,
  FileText, Clock, Bell, Edit2, Save, Activity,
} from "lucide-react";
import { getPatientProfile } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { User as UserType } from "@/types";

const upcomingAppointments = [
  { id: 1, doctor: "Dr. Sarah Johnson", dept: "Cardiology", date: "2024-07-20", time: "10:00 AM", status: "Accepted" },
  { id: 2, doctor: "Dr. Michael Chen", dept: "Neurology", date: "2024-08-05", time: "02:30 PM", status: "Pending" },
];

const activityLog = [
  { action: "Appointment booked", detail: "Cardiology - Dr. Sarah Johnson", date: "2024-06-15" },
  { action: "Prescription updated", detail: "Lisinopril 10mg added", date: "2024-06-10" },
  { action: "Lab report uploaded", detail: "Complete Blood Count (CBC)", date: "2024-06-05" },
  { action: "Profile updated", detail: "Phone number changed", date: "2024-05-28" },
  { action: "Account created", detail: "Patient registration completed", date: "2024-05-01" },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", email: "" });

  useEffect(() => {
    getPatientProfile()
      .then((res) => {
        setUser(res.data.user);
        setEditForm({ phone: res.data.user.phone, email: res.data.user.email });
      })
      .catch(() => toast.error("Please log in to view your profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully");
  };

  if (loading) {
    return (
      <div className="py-12 bg-muted/30 min-h-screen">
        <div className="container max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center min-h-screen bg-muted/30">
        <div className="container max-w-md">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
          <Button variant="gradient" asChild>
            <a href="/auth/login">Login to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-muted/30 min-h-screen">
      <div className="container max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pt-2">
                <h1 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />{user.email}
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <Badge variant="success" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />Verified
                </Badge>
                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your registered details</CardDescription>
                </div>
                <Button
                  variant={editing ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => editing ? handleSave() : setEditing(true)}
                >
                  {editing ? <><Save className="mr-2 h-3.5 w-3.5" />Save</> : <><Edit2 className="mr-2 h-3.5 w-3.5" />Edit</>}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />First Name
                    </Label>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <User className="h-3 w-3" />Last Name
                    </Label>
                    <p className="font-medium">{user.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />Email
                    </Label>
                    {editing ? (
                      <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    ) : (
                      <p className="font-medium">{user.email}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />Phone
                    </Label>
                    {editing ? (
                      <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    ) : (
                      <p className="font-medium">{user.phone}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3" />NIC Number
                    </Label>
                    <p className="font-medium font-mono">{user.NIC}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />Date of Birth
                    </Label>
                    <p className="font-medium">{formatDate(user.DOB)}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Heart className="h-3 w-3" />Gender
                    </Label>
                    <p className="font-medium">{user.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3 w-3" />Account Role
                    </Label>
                    <Badge variant="default">{user.role}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Appointments */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled visits</CardDescription>
                </div>
                <Button variant="gradient" size="sm" asChild>
                  <a href="/appointment"><Calendar className="mr-2 h-3.5 w-3.5" />Book New</a>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{apt.doctor}</p>
                        <p className="text-xs text-muted-foreground">{apt.dept}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">{apt.date}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3 w-3" />{apt.time}
                        </p>
                      </div>
                      <Badge
                        variant={apt.status === "Accepted" ? "success" : "warning"}
                        className="text-xs shrink-0"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Health Records</h3>
                    <p className="text-sm text-muted-foreground">View your complete medical history and reports</p>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/health-records">View Records</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent actions on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLog.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        {i < activityLog.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-sm">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{item.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Appointment Reminders", desc: "Get notified before your appointments", enabled: true },
                    { label: "Lab Results", desc: "Receive alerts when lab results are ready", enabled: true },
                    { label: "Prescription Updates", desc: "Alerts for prescription changes and refills", enabled: false },
                    { label: "Promotional Offers", desc: "Health packages and seasonal offers", enabled: false },
                  ].map((pref) => (
                    <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{pref.label}</p>
                          <p className="text-xs text-muted-foreground">{pref.desc}</p>
                        </div>
                      </div>
                      <button
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          pref.enabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                            pref.enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete Account</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
