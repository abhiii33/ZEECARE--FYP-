"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CheckCircle, XCircle, Clock, Trash2, RefreshCw } from "lucide-react";
import { getAllAppointments, updateAppointment, deleteAppointment } from "@/lib/api";
import { cn, getStatusColor, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Appointment } from "@/types";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = () => {
    setLoading(true);
    getAllAppointments()
      .then((res) => setAppointments(res.data.appointments || []))
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateAppointment(id, { status });
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status: status as Appointment["status"] } : a));
      toast.success(`Appointment ${status.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = appointments.filter((a) => {
    const name = `${a.firstName} ${a.lastName} ${a.department}`.toLowerCase();
    return name.includes(search.toLowerCase()) && (statusFilter === "All" || a.status === statusFilter);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground text-sm">Manage and track all patient appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or department..." className="pl-9" value={search}
            onChange={(e) => setSearch(e.target.value)} />
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
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((apt) => (
                <div
                  key={apt._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                      {apt.firstName[0]}{apt.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{apt.firstName} {apt.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName} • {apt.department}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(apt.appointment_date)} • {apt.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn("text-xs", getStatusColor(apt.status))}>
                      {apt.status === "Accepted" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {apt.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                      {apt.status === "Rejected" && <XCircle className="mr-1 h-3 w-3" />}
                      {apt.status}
                    </Badge>
                    {apt.hasVisited && (
                      <Badge variant="outline" className="text-xs">Visited</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleStatus(apt._id, "Accepted")}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatus(apt._id, "Rejected")}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(apt._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No appointments found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}
