"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  CalendarDays,
  Phone,
  Mail,
  User,
  CheckCheck,
} from "lucide-react";
import { getAllAppointments, updateAppointment, getDoctorProfile } from "@/lib/api";
import { cn, getStatusColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Appointment } from "@/types";

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, appointmentsRes] = await Promise.all([
        doctorId ? Promise.resolve(null) : getDoctorProfile(),
        getAllAppointments(),
      ]);

      if (profileRes) {
        setDoctorId(profileRes.data.user._id);
      }

      const allAppointments: Appointment[] =
        appointmentsRes.data.appointments || [];
      const currentDoctorId = profileRes
        ? profileRes.data.user._id
        : doctorId;

      setAppointments(
        allAppointments.filter((a) => a.doctorId === currentDoctorId)
      );
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateAppointment(id, { status });
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === id
            ? { ...a, status: status as Appointment["status"] }
            : a
        )
      );
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update appointment status");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateAppointment(id, { hasVisited: true });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, hasVisited: true } : a))
      );
      toast.success("Appointment marked as complete");
    } catch {
      toast.error("Failed to mark appointment as complete");
    }
  };

  const filtered = appointments.filter((a) => {
    const name = `${a.firstName} ${a.lastName}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || a.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      new Date(a.appointment_date).toISOString().split("T")[0] === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    accepted: appointments.filter((a) => a.status === "Accepted").length,
    rejected: appointments.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your patient appointments
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.accepted}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-full sm:w-44"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
            {statusFilter !== "All" && (
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {statusFilter}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="h-8 w-8 text-emerald-300" />
              </div>
              <p className="text-muted-foreground font-medium">
                No appointments found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {search || statusFilter !== "All" || dateFilter
                  ? "Try adjusting your filters"
                  : "New appointments will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((apt) => (
                <div
                  key={apt._id}
                  className="card-hover flex flex-col gap-4 p-4 rounded-xl border hover:border-emerald-300/50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Patient Avatar & Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-11 w-11 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-semibold text-emerald-700 dark:text-emerald-300 text-sm shrink-0">
                        {apt.firstName[0]}
                        {apt.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {apt.firstName} {apt.lastName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(apt.appointment_date)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {apt.department}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {apt.phone}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {apt.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
                      {apt.hasVisited && (
                        <Badge
                          variant="outline"
                          className="text-xs border-emerald-200 text-emerald-700 dark:text-emerald-400"
                        >
                          <CheckCheck className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 sm:justify-end">
                    {apt.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleStatus(apt._id, "Accepted")}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleStatus(apt._id, "Rejected")}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {apt.status === "Accepted" && !apt.hasVisited && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        onClick={() => handleComplete(apt._id)}
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
