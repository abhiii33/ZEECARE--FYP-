"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  UserPlus,
  FileText,
  Calendar,
  Activity,
  Heart,
  Thermometer,
  Weight,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import {
  getAllAppointments,
  getPatientRecords,
  createMedicalRecord,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Appointment } from "@/types";

interface MedicalRecord {
  _id: string;
  patientId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  date: string;
  vitalSigns?: {
    bloodPressure?: string;
    temperature?: string;
    heartRate?: string;
    weight?: string;
  };
  createdAt: string;
}

interface UniquePatient {
  patientId: string;
  firstName: string;
  lastName: string;
  gender: string;
  lastVisit: string;
  totalVisits: number;
}

const initialForm = {
  patientId: "",
  diagnosis: "",
  treatment: "",
  notes: "",
  bloodPressure: "",
  temperature: "",
  heartRate: "",
  weight: "",
};

export default function DoctorPatientRecordsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<UniquePatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<UniquePatient | null>(
    null
  );
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const extractPatients = (appts: Appointment[]): UniquePatient[] => {
    const map = new Map<string, UniquePatient>();
    for (const appt of appts) {
      const existing = map.get(appt.patientId);
      if (existing) {
        existing.totalVisits += 1;
        if (new Date(appt.appointment_date) > new Date(existing.lastVisit)) {
          existing.lastVisit = appt.appointment_date;
        }
      } else {
        map.set(appt.patientId, {
          patientId: appt.patientId,
          firstName: appt.firstName,
          lastName: appt.lastName,
          gender: appt.gender,
          lastVisit: appt.appointment_date,
          totalVisits: 1,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments();
      const appts = res.data.appointments || [];
      setAppointments(appts);
      setPatients(extractPatients(appts));
    } catch {
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchRecords = async (patientId: string) => {
    setRecordsLoading(true);
    try {
      const res = await getPatientRecords(patientId);
      setRecords(res.data.records || res.data || []);
    } catch {
      toast.error("Failed to load medical records");
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleSelectPatient = (patient: UniquePatient) => {
    setSelectedPatient(patient);
    fetchRecords(patient.patientId);
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setRecords([]);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) {
      toast.error("Please select a patient");
      return;
    }
    setSubmitting(true);
    try {
      await createMedicalRecord({
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        treatment: form.treatment,
        notes: form.notes,
        vitalSigns: {
          bloodPressure: form.bloodPressure,
          temperature: form.temperature,
          heartRate: form.heartRate,
          weight: form.weight,
        },
      });
      toast.success("Medical record created successfully");
      setDialogOpen(false);
      setForm(initialForm);
      if (selectedPatient && form.patientId === selectedPatient.patientId) {
        fetchRecords(selectedPatient.patientId);
      }
    } catch {
      toast.error("Failed to create medical record");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Total Visits",
      value: appointments.length,
      icon: Calendar,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      title: "Records Loaded",
      value: records.length,
      icon: FileText,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Patient Records</h1>
          <p className="text-muted-foreground text-sm">
            View and manage medical records for your patients
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Record
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

      {/* Patient Detail View */}
      {selectedPatient ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </Button>

          {/* Patient Info Card */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-lg shrink-0">
                  {selectedPatient.firstName[0]}
                  {selectedPatient.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                    <Badge
                      className={cn(
                        "text-xs",
                        selectedPatient.gender === "Male"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                      )}
                    >
                      {selectedPatient.gender}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last visit: {formatDate(selectedPatient.lastVisit)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList className="h-3 w-3" />
                      {selectedPatient.totalVisits} visit
                      {selectedPatient.totalVisits !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      patientId: selectedPatient.patientId,
                    }));
                    setDialogOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Add Record
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medical Records List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                Medical Records
                {!recordsLoading && (
                  <Badge variant="secondary" className="ml-2">
                    {records.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No medical records found
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click &quot;Add Record&quot; to create one
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div
                      key={record._id}
                      className="p-4 rounded-xl border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
                            {record.diagnosis}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.date || record.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Treatment
                          </p>
                          <p className="text-sm">{record.treatment}</p>
                        </div>
                        {record.notes && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Notes
                            </p>
                            <p className="text-sm">{record.notes}</p>
                          </div>
                        )}
                      </div>

                      {record.vitalSigns &&
                        (record.vitalSigns.bloodPressure ||
                          record.vitalSigns.temperature ||
                          record.vitalSigns.heartRate ||
                          record.vitalSigns.weight) && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Vital Signs
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {record.vitalSigns.bloodPressure && (
                                  <div className="flex items-center gap-1.5 text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-lg">
                                    <Activity className="h-3.5 w-3.5" />
                                    {record.vitalSigns.bloodPressure}
                                  </div>
                                )}
                                {record.vitalSigns.temperature && (
                                  <div className="flex items-center gap-1.5 text-sm bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                                    <Thermometer className="h-3.5 w-3.5" />
                                    {record.vitalSigns.temperature}
                                  </div>
                                )}
                                {record.vitalSigns.heartRate && (
                                  <div className="flex items-center gap-1.5 text-sm bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 px-2.5 py-1 rounded-lg">
                                    <Heart className="h-3.5 w-3.5" />
                                    {record.vitalSigns.heartRate}
                                  </div>
                                )}
                                {record.vitalSigns.weight && (
                                  <div className="flex items-center gap-1.5 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg">
                                    <Weight className="h-3.5 w-3.5" />
                                    {record.vitalSigns.weight}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Patient List View */
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                All Patients
                {!loading && (
                  <Badge variant="secondary" className="ml-2">
                    {filteredPatients.length}
                  </Badge>
                )}
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No patients match your search" : "No patients found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.patientId}
                    onClick={() => handleSelectPatient(patient)}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-semibold text-emerald-700 dark:text-emerald-300 text-sm shrink-0">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last visit: {formatDate(patient.lastVisit)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" />
                          {patient.totalVisits} visit
                          {patient.totalVisits !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Gender Badge */}
                    <Badge
                      className={cn(
                        "text-xs shrink-0",
                        patient.gender === "Male"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                      )}
                    >
                      {patient.gender}
                    </Badge>

                    {/* View button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30 shrink-0"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      View Records
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Record Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            {/* Patient Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Patient</label>
              <Select
                value={form.patientId}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, patientId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.patientId} value={p.patientId}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Diagnosis</label>
              <Input
                placeholder="e.g. Acute Bronchitis"
                value={form.diagnosis}
                onChange={(e) =>
                  setForm((f) => ({ ...f, diagnosis: e.target.value }))
                }
                required
              />
            </div>

            {/* Treatment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment</label>
              <Textarea
                placeholder="Describe the treatment plan..."
                value={form.treatment}
                onChange={(e) =>
                  setForm((f) => ({ ...f, treatment: e.target.value }))
                }
                rows={3}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes (optional)"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>

            <Separator />

            {/* Vital Signs */}
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Vital Signs
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Blood Pressure
                  </label>
                  <Input
                    placeholder="e.g. 120/80"
                    value={form.bloodPressure}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bloodPressure: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    Temperature
                  </label>
                  <Input
                    placeholder="e.g. 98.6 F"
                    value={form.temperature}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, temperature: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    Heart Rate
                  </label>
                  <Input
                    placeholder="e.g. 72 bpm"
                    value={form.heartRate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, heartRate: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Weight className="h-3 w-3" />
                    Weight
                  </label>
                  <Input
                    placeholder="e.g. 70 kg"
                    value={form.weight}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, weight: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {submitting ? "Creating..." : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
