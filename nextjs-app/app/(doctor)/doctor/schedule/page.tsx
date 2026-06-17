"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Plus,
  Clock,
  Users,
  Trash2,
  Pencil,
  CalendarOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  getDoctorProfile,
  getDoctorSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  applyLeave,
  getDoctorLeaves,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

/* ---------- local types ---------- */
interface Schedule {
  _id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  slotDuration: number;
  status: "Active" | "Inactive";
}

interface Leave {
  _id: string;
  doctorId: string;
  startDate: string;
  endDate: string;
  reason: string;
  leaveType: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

/* ---------- helpers ---------- */
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getScheduleStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "Inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getLeaveStatusColor(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getLeaveTypeBadgeColor(type: string) {
  switch (type) {
    case "Sick":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300";
    case "Personal":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300";
    case "Conference":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300";
    case "Vacation":
      return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300";
  }
}

/* ---------- component ---------- */
export default function DoctorSchedulePage() {
  const [doctorId, setDoctorId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);

  // dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // schedule form
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    maxPatients: "",
    slotDuration: "30",
  });

  // leave form
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "Personal",
  });

  /* ---- fetch ---- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const profileRes = await getDoctorProfile();
      const id = profileRes.data.user._id;
      setDoctorId(id);

      const [scheduleRes, leavesRes] = await Promise.all([
        getDoctorSchedule(id),
        getDoctorLeaves(id).catch(() => ({ data: { leaves: [] } })),
      ]);
      const data = scheduleRes.data;
      setSchedules(data.schedules || data || []);
      setLeaves(leavesRes.data.leaves || []);
    } catch {
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---- schedule actions ---- */
  const openAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      maxPatients: "",
      slotDuration: "30",
    });
    setScheduleDialogOpen(true);
  };

  const openEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxPatients: String(schedule.maxPatients),
      slotDuration: String(schedule.slotDuration),
    });
    setScheduleDialogOpen(true);
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        doctorId,
        dayOfWeek: scheduleForm.dayOfWeek,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        maxPatients: Number(scheduleForm.maxPatients),
        slotDuration: Number(scheduleForm.slotDuration),
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, payload);
        toast.success("Schedule updated successfully!");
      } else {
        await createSchedule(payload);
        toast.success("Schedule created successfully!");
      }

      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Delete this schedule slot?")) return;
    try {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s._id !== id));
      toast.success("Schedule deleted");
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleStatus = async (schedule: Schedule) => {
    const newStatus = schedule.status === "Active" ? "Inactive" : "Active";
    try {
      await updateSchedule(schedule._id, { status: newStatus });
      setSchedules((prev) =>
        prev.map((s) =>
          s._id === schedule._id ? { ...s, status: newStatus as Schedule["status"] } : s
        )
      );
      toast.success(`Schedule ${newStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ---- leave actions ---- */
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave({
        doctorId,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        leaveType: leaveForm.leaveType,
      });
      toast.success("Leave application submitted!");
      setLeaveDialogOpen(false);
      setLeaveForm({ startDate: "", endDate: "", reason: "", leaveType: "Personal" });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- derived ---- */
  const scheduleByDay = DAYS_OF_WEEK.map((day) => ({
    day,
    slots: schedules.filter((s) => s.dayOfWeek === day),
  }));

  const upcomingLeaves = leaves.filter(
    (l) => new Date(l.endDate) >= new Date()
  );

  /* ---- stat cards ---- */
  const activeDays = new Set(schedules.filter((s) => s.status === "Active").map((s) => s.dayOfWeek)).size;
  const totalSlots = schedules.filter((s) => s.status === "Active").length;
  const totalMaxPatients = schedules
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + s.maxPatients, 0);

  const statCards = [
    {
      title: "Active Days",
      value: activeDays,
      icon: CalendarDays,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Total Slots",
      value: totalSlots,
      icon: Clock,
      color: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      title: "Max Patients/Week",
      value: totalMaxPatients,
      icon: Users,
      color: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
    {
      title: "Upcoming Leaves",
      value: upcomingLeaves.length,
      icon: CalendarOff,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground text-sm">
            Manage your consulting hours and availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLeaveDialogOpen(true)}
          >
            <CalendarOff className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={openAddSchedule}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* ====== Stat Cards ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(stat.bg, "p-2.5 rounded-lg")}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
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

      {/* ====== Weekly Schedule Grid ====== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No schedule configured yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Set up your consulting hours for each day of the week
              </p>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={openAddSchedule}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleByDay.map(({ day, slots }) => (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold w-24 text-emerald-700 dark:text-emerald-400">
                      {day}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  {slots.length === 0 ? (
                    <p className="text-xs text-muted-foreground ml-24 mb-3">
                      No schedule set
                    </p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {slots.map((slot) => (
                        <div
                          key={slot._id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 ml-0 sm:ml-24 rounded-xl border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {slot.maxPatients} patients max
                                </span>
                                <span>{slot.slotDuration} min/slot</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Badge className={cn("text-xs", getScheduleStatusColor(slot.status))}>
                              {slot.status}
                            </Badge>
                            <Switch
                              checked={slot.status === "Active"}
                              onCheckedChange={() => handleToggleStatus(slot)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-emerald-600"
                              onClick={() => openEditSchedule(slot)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteSchedule(slot._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== Upcoming Leaves ====== */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarOff className="h-4 w-4 text-amber-500" />
            Upcoming Leaves
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingLeaves.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No upcoming leaves</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                      <CalendarOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{leave.reason}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getLeaveTypeBadgeColor(leave.leaveType))}
                    >
                      {leave.leaveType}
                    </Badge>
                    <Badge className={cn("text-xs", getLeaveStatusColor(leave.status))}>
                      {leave.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== Add/Edit Schedule Dialog ====== */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitSchedule} className="space-y-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select
                value={scheduleForm.dayOfWeek}
                onValueChange={(v) =>
                  setScheduleForm((f) => ({ ...f, dayOfWeek: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Patients</Label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={scheduleForm.maxPatients}
                  onChange={(e) =>
                    setScheduleForm((f) => ({ ...f, maxPatients: e.target.value }))
                  }
                  required
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Slot Duration</Label>
                <Select
                  value={scheduleForm.slotDuration}
                  onValueChange={(v) =>
                    setScheduleForm((f) => ({ ...f, slotDuration: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
              >
                {submitting
                  ? editingSchedule
                    ? "Updating..."
                    : "Creating..."
                  : editingSchedule
                    ? "Update Schedule"
                    : "Create Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====== Apply Leave Dialog ====== */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={leaveForm.leaveType}
                onValueChange={(v) =>
                  setLeaveForm((f) => ({ ...f, leaveType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Personal">Personal Leave</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Vacation">Vacation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="Reason for leave..."
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm((f) => ({ ...f, reason: e.target.value }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLeaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Leave"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
