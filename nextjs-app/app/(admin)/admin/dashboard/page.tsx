"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar, Stethoscope, MessageSquare, TrendingUp, Users,
  Activity, ArrowUpRight, CheckCircle, Clock, XCircle,
} from "lucide-react";
import { getAllAppointments, getAllDoctors, getAllMessages } from "@/lib/api";
import { cn, getStatusColor } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { Appointment } from "@/types";

const COLORS = ["#9b5de5", "#3b82f6", "#22c55e", "#f97316"];

const weeklyData = [
  { day: "Mon", appointments: 12 },
  { day: "Tue", appointments: 18 },
  { day: "Wed", appointments: 15 },
  { day: "Thu", appointments: 22 },
  { day: "Fri", appointments: 19 },
  { day: "Sat", appointments: 8 },
  { day: "Sun", appointments: 5 },
];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllAppointments(), getAllDoctors(), getAllMessages()])
      .then(([appts, docs, msgs]) => {
        setAppointments(appts.data.appointments || []);
        setDoctorsCount(docs.data.doctors?.length || 0);
        setMessagesCount(msgs.data.messages?.length || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = appointments.filter((a) => a.status === "Pending").length;
  const accepted = appointments.filter((a) => a.status === "Accepted").length;
  const rejected = appointments.filter((a) => a.status === "Rejected").length;

  const statusData = [
    { name: "Accepted", value: accepted },
    { name: "Pending", value: pending },
    { name: "Rejected", value: rejected },
  ];

  const statCards = [
    { title: "Total Appointments", value: appointments.length, icon: Calendar, change: "+12%", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { title: "Active Doctors", value: doctorsCount, icon: Stethoscope, change: "+3", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
    { title: "Messages", value: messagesCount, icon: MessageSquare, change: "+8", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    { title: "Success Rate", value: "94%", icon: TrendingUp, change: "+2%", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          System Online
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
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />Weekly Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="appointments" fill="#9b5de5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />Appointment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {[
                { label: "Accepted", count: accepted, color: "bg-purple-500" },
                { label: "Pending", count: pending, color: "bg-blue-500" },
                { label: "Rejected", count: rejected, color: "bg-green-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Appointments</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/admin/appointments">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.slice(0, 5).map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                    {apt.firstName[0]}{apt.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{apt.firstName} {apt.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Dr. {apt.doctor?.firstName} {apt.doctor?.lastName} • {apt.department}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={cn("text-xs", getStatusColor(apt.status))}>
                      {apt.status === "Accepted" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {apt.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                      {apt.status === "Rejected" && <XCircle className="mr-1 h-3 w-3" />}
                      {apt.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No appointments yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", value: pending, icon: Clock, color: "text-yellow-500", progress: (pending / (appointments.length || 1)) * 100 },
          { label: "Accepted", value: accepted, icon: CheckCircle, color: "text-green-500", progress: (accepted / (appointments.length || 1)) * 100 },
          { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-500", progress: (rejected / (appointments.length || 1)) * 100 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold mb-2">{s.value}</p>
              <Progress value={s.progress} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
