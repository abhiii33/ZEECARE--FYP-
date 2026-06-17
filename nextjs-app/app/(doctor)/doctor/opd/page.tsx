"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Users,
  UserCheck,
  Stethoscope,
  SkipForward,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getOPDQueue,
  getOPDDailyReport,
  callNextOPDPatient,
  updateOPDStatus,
  skipOPDPatient,
} from "@/lib/api";
import { cn, formatTime } from "@/lib/utils";
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
}

interface DailyReport {
  totalTokens: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  avgWaitTime: number;
}

export default function DoctorOPDQueuePage() {
  const [queue, setQueue] = useState<OPDPatient[]>([]);
  const [report, setReport] = useState<DailyReport>({
    totalTokens: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    avgWaitTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [queueRes, reportRes] = await Promise.all([
        getOPDQueue(),
        getOPDDailyReport(),
      ]);
      setQueue(queueRes.data.queue || queueRes.data.patients || []);
      setReport(
        reportRes.data.report || reportRes.data || {
          totalTokens: 0,
          waiting: 0,
          inConsultation: 0,
          completed: 0,
          avgWaitTime: 0,
        }
      );
    } catch {
      toast.error("Failed to load OPD data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCallNext = async () => {
    setActionLoading("call-next");
    try {
      await callNextOPDPatient();
      toast.success("Next patient called for consultation");
      fetchData();
    } catch {
      toast.error("Failed to call next patient");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await updateOPDStatus(id, "Completed");
      toast.success("Consultation completed");
      fetchData();
    } catch {
      toast.error("Failed to complete consultation");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSkip = async (id: string) => {
    setActionLoading(id);
    try {
      await skipOPDPatient(id);
      toast.success("Patient skipped");
      fetchData();
    } catch {
      toast.error("Failed to skip patient");
    } finally {
      setActionLoading(null);
    }
  };

  const currentPatient = queue.find((p) => p.status === "InConsultation");
  const waitingPatients = queue.filter(
    (p) => p.status === "Waiting" || p.status === "Registered"
  );

  const stats = [
    {
      title: "Waiting",
      value: report.waiting,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "In Consultation",
      value: report.inConsultation,
      icon: Stethoscope,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Completed Today",
      value: report.completed,
      icon: CheckCircle,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">OPD Queue</h1>
          <p className="text-muted-foreground text-sm">
            Manage your outpatient consultations
          </p>
        </div>
        <Button
          onClick={handleCallNext}
          disabled={actionLoading === "call-next"}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          <Stethoscope className="mr-2 h-4 w-4" />
          {actionLoading === "call-next" ? "Calling..." : "Call Next Patient"}
        </Button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(stat.bg, "p-2.5 rounded-lg")}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Patient Card */}
      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : currentPatient ? (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-600" />
                Currently In Consultation
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                In Progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-lg shrink-0">
                #{currentPatient.tokenNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">
                  {currentPatient.patient.firstName} {currentPatient.patient.lastName}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                  {currentPatient.symptoms && (
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {currentPatient.symptoms}
                    </span>
                  )}
                  {currentPatient.checkInTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(currentPatient.checkInTime)}
                    </span>
                  )}
                  {currentPatient.priority === "Emergency" && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                      Emergency
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleComplete(currentPatient._id)}
                disabled={actionLoading === currentPatient._id}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <UserCheck className="mr-1 h-4 w-4" />
                {actionLoading === currentPatient._id ? "Completing..." : "Complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No patient currently in consultation
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Call Next Patient&quot; to begin
            </p>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-teal-600" />
            Waiting Queue
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {waitingPatients.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : waitingPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No patients waiting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                >
                  {/* Token Number */}
                  <div className="h-10 w-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center font-semibold text-teal-700 dark:text-teal-300 text-sm shrink-0">
                    #{patient.tokenNumber}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {patient.patient.firstName} {patient.patient.lastName}
                      </p>
                      {patient.priority === "Emergency" ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
                          Emergency
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Normal
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {patient.symptoms && (
                        <span className="truncate max-w-[250px]">
                          {patient.symptoms}
                        </span>
                      )}
                      {patient.checkInTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(patient.checkInTime)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skip Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800 shrink-0"
                    onClick={() => handleSkip(patient._id)}
                    disabled={actionLoading === patient._id}
                  >
                    <SkipForward className="mr-1 h-3 w-3" />
                    {actionLoading === patient._id ? "Skipping..." : "Skip"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
