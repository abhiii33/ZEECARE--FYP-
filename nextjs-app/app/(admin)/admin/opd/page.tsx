"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, UserCheck, PhoneCall, SkipForward } from "lucide-react";
import { getOPDQueue, getOPDDailyReport, updateOPDStatus, skipOPDPatient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OPDPatient {
  _id: string;
  tokenNumber: number;
  patient: {
    firstName: string;
    lastName: string;
  };
  status: "Registered" | "Waiting" | "InConsultation" | "Completed" | "Skipped";
  priority: "Normal" | "Emergency";
  symptoms: string;
  checkInTime: string;
  department?: string;
}

interface DailyReport {
  totalTokens: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  avgWaitTime: number;
}

const statusColorMap: Record<string, string> = {
  Registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  InConsultation: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Skipped: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function OPDQueuePage() {
  const [queue, setQueue] = useState<OPDPatient[]>([]);
  const [report, setReport] = useState<DailyReport>({
    totalTokens: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    avgWaitTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [shiftFilter, setShiftFilter] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (departmentFilter !== "All") params.department = departmentFilter;
    if (shiftFilter !== "All") params.shift = shiftFilter;

    Promise.all([getOPDQueue(params), getOPDDailyReport()])
      .then(([queueRes, reportRes]) => {
        setQueue(queueRes.data.queue || queueRes.data.patients || []);
        setReport(reportRes.data.report || reportRes.data || {
          totalTokens: 0,
          waiting: 0,
          inConsultation: 0,
          completed: 0,
          avgWaitTime: 0,
        });
      })
      .catch(() => toast.error("Failed to load OPD data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [departmentFilter, shiftFilter]);

  const handleCallNext = async (id: string) => {
    setActionLoading(id);
    try {
      await updateOPDStatus(id, "InConsultation");
      setQueue((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: "InConsultation" as const } : p))
      );
      toast.success("Patient called for consultation");
    } catch {
      toast.error("Failed to call patient");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = async (id: string) => {
    setActionLoading(id);
    try {
      await skipOPDPatient(id);
      setQueue((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: "Skipped" as const } : p))
      );
      toast.success("Patient skipped");
    } catch {
      toast.error("Failed to skip patient");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await updateOPDStatus(id, "Completed");
      setQueue((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: "Completed" as const } : p))
      );
      toast.success("Consultation completed");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const stats = [
    {
      title: "Total Tokens Today",
      value: report.totalTokens,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Waiting",
      value: report.waiting,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "In Consultation",
      value: report.inConsultation,
      icon: PhoneCall,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Completed",
      value: report.completed,
      icon: UserCheck,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Avg Wait Time",
      value: `${report.avgWaitTime} min`,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">OPD Queue Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage outpatient department queue and consultations
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
            </SelectContent>
          </Select>
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Shifts</SelectItem>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No patients in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((patient) => (
                <div
                  key={patient._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all"
                >
                  {/* Token Number */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                    #{patient.tokenNumber}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {patient.patient.firstName} {patient.patient.lastName}
                      </p>
                      {patient.priority === "Emergency" && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                          Emergency
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {patient.symptoms && (
                        <span className="truncate max-w-[200px]">{patient.symptoms}</span>
                      )}
                      {patient.checkInTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(patient.checkInTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      "text-xs shrink-0",
                      statusColorMap[patient.status] || statusColorMap.Registered
                    )}
                  >
                    {patient.status === "InConsultation" ? "In Consultation" : patient.status}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {(patient.status === "Registered" || patient.status === "Waiting") && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => handleCallNext(patient._id)}
                          disabled={actionLoading === patient._id}
                        >
                          <PhoneCall className="mr-1 h-3 w-3" />
                          Call Next
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 border-gray-200 hover:bg-gray-50"
                          onClick={() => handleSkip(patient._id)}
                          disabled={actionLoading === patient._id}
                        >
                          <SkipForward className="mr-1 h-3 w-3" />
                          Skip
                        </Button>
                      </>
                    )}
                    {patient.status === "InConsultation" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleComplete(patient._id)}
                        disabled={actionLoading === patient._id}
                      >
                        <UserCheck className="mr-1 h-3 w-3" />
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
    </div>
  );
}
