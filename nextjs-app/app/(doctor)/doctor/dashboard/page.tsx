"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  CheckCircle,
  Users,
  ArrowUpRight,
  XCircle,
  ClipboardList,
  CalendarClock,
  FileText,
  Stethoscope,
  Activity,
} from "lucide-react";
import {
  getDoctorProfile,
  getAllAppointments,
  getDoctorSchedule,
  getOPDQueue,
  updateAppointment,
} from "@/lib/api";
import { cn, formatDate, formatTime, getStatusColor } from "@/lib/utils";
import type { Appointment, User } from "@/types";
import { toast } from "sonner";

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [opdCount, setOpdCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileRes, appointmentsRes, opdRes] = await Promise.all([
        getDoctorProfile(),
        getAllAppointments(),
        getOPDQueue(),
      ]);

      const doc = profileRes.data.user;
      setDoctor(doc);

      const allAppointments: Appointment[] =
        appointmentsRes.data.appointments || [];
      // Filter appointments assigned to this doctor
      const doctorAppointments = allAppointments.filter(
        (a) => a.doctorId === doc._id
      );
      setAppointments(doctorAppointments);

      const queue = opdRes.data.queue || opdRes.data.patients || [];
      setOpdCount(Array.isArray(queue) ? queue.length : 0);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const today = new Date().toDateString();
  const todaysAppointments = appointments.filter(
    (a) => new Date(a.appointment_date).toDateString() === today
  );
  const pendingAppointments = appointments.filter(
    (a) => a.status === "Pending"
  );
  const completedToday = todaysAppointments.filter(
    (a) => a.status === "Accepted" && a.hasVisited
  );

  const handleAccept = async (id: string) => {
    try {
      await updateAppointment(id, { status: "Accepted" });
      toast.success("Appointment accepted");
      fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept appointment"
      );
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateAppointment(id, { hasVisited: true });
      toast.success("Appointment marked as completed");
      fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to complete appointment"
      );
    }
  };

  const statCards = [
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: Calendar,
      change: `${todaysAppointments.length} scheduled`,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Pending Appointments",
      value: pendingAppointments.length,
      icon: Clock,
      change: "awaiting review",
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      title: "Completed Today",
      value: completedToday.length,
      icon: CheckCircle,
      change: `of ${todaysAppointments.length} total`,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "OPD Queue",
      value: opdCount,
      icon: Users,
      change: "patients waiting",
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {loading ? (
            <>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                Welcome, Dr. {doctor?.firstName} {doctor?.lastName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {doctor?.doctorDepartment || "General"} Department
              </p>
            </>
          )}
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          On Duty
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
              )}
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Appointments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Today&apos;s Appointments
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/doctor/appointments">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : todaysAppointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="space-y-2">
              {todaysAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-semibold text-emerald-600 text-sm shrink-0">
                    {apt.firstName[0]}
                    {apt.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {apt.firstName} {apt.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTime(apt.appointment_date)} &bull;{" "}
                      {apt.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={cn("text-xs", getStatusColor(apt.status))}
                    >
                      {apt.status === "Accepted" && (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {apt.status === "Pending" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {apt.status === "Rejected" && (
                        <XCircle className="mr-1 h-3 w-3" />
                      )}
                      {apt.status}
                    </Badge>
                    {apt.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                        onClick={() => handleAccept(apt._id)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                    )}
                    {apt.status === "Accepted" && !apt.hasVisited && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950/30"
                        onClick={() => handleComplete(apt._id)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
              asChild
            >
              <a href="/doctor/schedule">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg">
                  <CalendarClock className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-sm font-medium">View Schedule</span>
                <span className="text-xs text-muted-foreground">
                  Manage your consulting hours
                </span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
              asChild
            >
              <a href="/doctor/opd">
                <div className="bg-teal-50 dark:bg-teal-950/30 p-2.5 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-teal-500" />
                </div>
                <span className="text-sm font-medium">Manage OPD</span>
                <span className="text-xs text-muted-foreground">
                  View and manage OPD queue
                </span>
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 card-hover"
              asChild
            >
              <a href="/doctor/prescriptions">
                <div className="bg-cyan-50 dark:bg-cyan-950/30 p-2.5 rounded-lg">
                  <FileText className="h-5 w-5 text-cyan-500" />
                </div>
                <span className="text-sm font-medium">Write Prescription</span>
                <span className="text-xs text-muted-foreground">
                  Create a new prescription
                </span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
