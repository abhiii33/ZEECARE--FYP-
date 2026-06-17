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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pill,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Search,
  ClipboardList,
} from "lucide-react";
import {
  getAllAppointments,
  createPrescription,
  getPatientPrescriptions,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  patientId: string;
  patientName: string;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  status: string;
  createdAt: string;
}

interface Appointment {
  _id: string;
  firstName: string;
  lastName: string;
  patientId: string;
  department: string;
  status: string;
}

const emptyMedication: Medication = {
  name: "",
  dosage: "",
  frequency: "Once daily",
  duration: "",
  instructions: "",
};

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [selectedPatient, setSelectedPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { ...emptyMedication },
  ]);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes] = await Promise.all([getAllAppointments()]);
      const aptData = aptRes.data.appointments || aptRes.data || [];
      setAppointments(aptData);

      // Collect prescriptions from all unique patients
      const patientIds = Array.from(
        new Set<string>(
          aptData
            .map((a: Appointment) => a.patientId)
            .filter((id: string) => id)
        )
      );

      const prescriptionResults = await Promise.allSettled(
        patientIds.map((id: string) => getPatientPrescriptions(id))
      );

      const allPrescriptions: Prescription[] = [];
      prescriptionResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const data =
            result.value.data.prescriptions || result.value.data || [];
          if (Array.isArray(data)) {
            allPrescriptions.push(...data);
          }
        }
      });

      // Sort by date, newest first
      allPrescriptions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPrescriptions(allPrescriptions);
    } catch {
      toast.error("Failed to load prescriptions data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setSelectedPatient("");
    setDiagnosis("");
    setMedications([{ ...emptyMedication }]);
    setNotes("");
  };

  const handleAddMedication = () => {
    setMedications((prev) => [...prev, { ...emptyMedication }]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis");
      return;
    }
    if (medications.some((m) => !m.name.trim() || !m.dosage.trim())) {
      toast.error("Please fill in medicine name and dosage for all medications");
      return;
    }

    const patient = appointments.find((a) => a.patientId === selectedPatient);

    setSubmitting(true);
    try {
      await createPrescription({
        patientId: selectedPatient,
        patientName: patient
          ? `${patient.firstName} ${patient.lastName}`
          : "Unknown",
        diagnosis,
        medications,
        notes,
      });
      toast.success("Prescription created successfully");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error("Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 text-xs">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
            {status || "Pending"}
          </Badge>
        );
    }
  };

  // Unique patients from appointments for the selector
  const uniquePatients = appointments.reduce(
    (acc: Appointment[], apt) => {
      if (apt.patientId && !acc.find((a) => a.patientId === apt.patientId)) {
        acc.push(apt);
      }
      return acc;
    },
    []
  );

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      title: "Total Prescriptions",
      value: prescriptions.length,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Active",
      value: prescriptions.filter(
        (p) => p.status?.toLowerCase() === "active" || !p.status
      ).length,
      icon: Pill,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      title: "Patients",
      value: new Set(prescriptions.map((p) => p.patientId)).size,
      icon: ClipboardList,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground text-sm">
            Manage and create patient prescriptions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
              onClick={() => resetForm()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-emerald-600" />
                New Prescription
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Patient Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient *</label>
                <Select
                  value={selectedPatient}
                  onValueChange={setSelectedPatient}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniquePatients.map((apt) => (
                      <SelectItem key={apt.patientId} value={apt.patientId}>
                        {apt.firstName} {apt.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Diagnosis */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis *</label>
                <Input
                  placeholder="Enter diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <Separator />

              {/* Medications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Medications *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMedication}
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Medication
                  </Button>
                </div>

                {medications.map((med, index) => (
                  <Card
                    key={index}
                    className="border-dashed border-emerald-200 dark:border-emerald-800"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Medication #{index + 1}
                        </span>
                        {medications.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(index)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Medicine name"
                          value={med.name}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                        />
                        <Input
                          placeholder="Dosage (e.g., 500mg)"
                          value={med.dosage}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "dosage",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Select
                          value={med.frequency}
                          onValueChange={(value) =>
                            handleMedicationChange(index, "frequency", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Once daily">
                              Once daily
                            </SelectItem>
                            <SelectItem value="Twice daily">
                              Twice daily
                            </SelectItem>
                            <SelectItem value="Three times daily">
                              Three times daily
                            </SelectItem>
                            <SelectItem value="As needed">As needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Duration (e.g., 7 days)"
                          value={med.duration}
                          onChange={(e) =>
                            handleMedicationChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Input
                        placeholder="Special instructions (optional)"
                        value={med.instructions}
                        onChange={(e) =>
                          handleMedicationChange(
                            index,
                            "instructions",
                            e.target.value
                          )
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any additional notes or instructions for the patient..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
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
                  {submitting ? "Creating..." : "Create Prescription"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search prescriptions by patient or diagnosis..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Prescriptions List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            Recent Prescriptions
            {!loading && (
              <Badge variant="secondary" className="ml-2">
                {filteredPrescriptions.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No prescriptions found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;New Prescription&quot; to create one
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="rounded-xl border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                >
                  {/* Prescription Summary Row */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleExpanded(prescription._id)}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-semibold text-emerald-700 dark:text-emerald-300 text-sm shrink-0">
                      {prescription.patientName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "RX"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">
                          {prescription.patientName || "Unknown Patient"}
                        </p>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(prescription.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          {prescription.medications?.length || 0} medication
                          {(prescription.medications?.length || 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                        {prescription.diagnosis && (
                          <span className="truncate max-w-[250px]">
                            {prescription.diagnosis}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {expandedId === prescription._id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === prescription._id && (
                    <div className="px-4 pb-4 pt-0">
                      <Separator className="mb-4" />
                      <div className="space-y-4">
                        {/* Diagnosis */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            Diagnosis
                          </p>
                          <p className="text-sm">
                            {prescription.diagnosis || "N/A"}
                          </p>
                        </div>

                        {/* Medications */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Medications
                          </p>
                          <div className="grid gap-2">
                            {prescription.medications?.map((med, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="flex items-center gap-2">
                                    <Pill className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <span className="font-medium text-sm">
                                      {med.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {med.dosage}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {med.frequency}
                                    </Badge>
                                    {med.duration && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {med.duration}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {med.instructions && (
                                  <p className="text-xs text-muted-foreground mt-2 ml-5">
                                    {med.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        {prescription.notes && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                              Additional Notes
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {prescription.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
