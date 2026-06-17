"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Bed, Building2, Plus, Users, Activity, AlertCircle } from "lucide-react";
import {
  getAllWards,
  getAllBeds,
  getBedOccupancy,
  getAllAllocations,
  createWard,
  createBed,
  dischargeBed,
} from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

/* ---------- local types ---------- */
interface Ward {
  _id: string;
  name: string;
  type: string;
  totalBeds: number;
  floor: number;
  dailyRate: number;
  status: string;
}

interface BedRecord {
  _id: string;
  ward: Ward | { _id: string; name: string };
  bedNumber: string;
  type: string;
  status: string;
  lastSanitized?: string;
}

interface Allocation {
  _id: string;
  patient: { _id: string; firstName: string; lastName: string };
  bed: { _id: string; bedNumber: string };
  doctor: { _id: string; firstName: string; lastName: string };
  admissionDate: string;
  expectedDischarge: string;
  status: string;
}

interface Occupancy {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
}

/* ---------- helpers ---------- */
function getBedStatusColor(status: string) {
  switch (status) {
    case "Available":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Occupied":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Reserved":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getWardStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "Full":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

function getAllocationStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Discharged":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Transferred":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}

/* ---------- component ---------- */
export default function BedManagementPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<BedRecord[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [occupancy, setOccupancy] = useState<Occupancy>({
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [bedStatusFilter, setBedStatusFilter] = useState("All");

  // dialog state
  const [wardDialogOpen, setWardDialogOpen] = useState(false);
  const [bedDialogOpen, setBedDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ward form
  const [wardForm, setWardForm] = useState({
    name: "",
    type: "General",
    totalBeds: "",
    floor: "",
    dailyRate: "",
  });

  // bed form
  const [bedForm, setBedForm] = useState({
    ward: "",
    bedNumber: "",
    type: "Standard",
  });

  /* ---- fetch ---- */
  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAllWards(),
      getAllBeds(),
      getBedOccupancy(),
      getAllAllocations(),
    ])
      .then(([wardsRes, bedsRes, occRes, allocRes]) => {
        setWards(wardsRes.data.wards || wardsRes.data || []);
        setBeds(bedsRes.data.beds || bedsRes.data || []);
        setOccupancy(
          occRes.data.occupancy || occRes.data || {
            totalBeds: 0,
            availableBeds: 0,
            occupiedBeds: 0,
            occupancyRate: 0,
          }
        );
        setAllocations(allocRes.data.allocations || allocRes.data || []);
      })
      .catch(() => toast.error("Failed to load bed management data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ---- actions ---- */
  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createWard({
        name: wardForm.name,
        type: wardForm.type,
        totalBeds: Number(wardForm.totalBeds),
        floor: Number(wardForm.floor),
        dailyRate: Number(wardForm.dailyRate),
      });
      toast.success("Ward created successfully!");
      setWardDialogOpen(false);
      setWardForm({ name: "", type: "General", totalBeds: "", floor: "", dailyRate: "" });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create ward");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBed({
        ward: bedForm.ward,
        bedNumber: bedForm.bedNumber,
        type: bedForm.type,
      });
      toast.success("Bed created successfully!");
      setBedDialogOpen(false);
      setBedForm({ ward: "", bedNumber: "", type: "Standard" });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create bed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (allocationId: string) => {
    if (!confirm("Discharge this patient?")) return;
    try {
      await dischargeBed(allocationId);
      setAllocations((prev) =>
        prev.map((a) =>
          a._id === allocationId ? { ...a, status: "Discharged" } : a
        )
      );
      toast.success("Patient discharged successfully");
      fetchData();
    } catch {
      toast.error("Failed to discharge patient");
    }
  };

  const handleAccept = async (allocationId: string) => {
    try {
      setAllocations((prev) =>
        prev.map((a) =>
          a._id === allocationId ? { ...a, status: "Active" } : a
        )
      );
      toast.success("Allocation accepted");
    } catch {
      toast.error("Failed to accept allocation");
    }
  };

  /* ---- derived ---- */
  const filteredBeds = beds.filter(
    (b) => bedStatusFilter === "All" || b.status === bedStatusFilter
  );

  /* ---- stat cards config ---- */
  const statCards = [
    {
      title: "Total Beds",
      value: occupancy.totalBeds,
      icon: Bed,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Available",
      value: occupancy.availableBeds,
      icon: Building2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Occupied",
      value: occupancy.occupiedBeds,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Occupancy Rate",
      value: `${Math.round(occupancy.occupancyRate)}%`,
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ====== Header ====== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bed Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage wards, beds, and patient allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWardDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Ward
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setBedDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bed
          </Button>
        </div>
      </div>

      {/* ====== Stat Cards ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} p-2.5 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
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

      {/* ====== Tabs ====== */}
      <Tabs defaultValue="wards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wards">Wards</TabsTrigger>
          <TabsTrigger value="beds">Beds</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        {/* ---------- Wards Tab ---------- */}
        <TabsContent value="wards">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          ) : wards.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No wards found</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setWardDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Ward
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wards.map((ward) => (
                <Card key={ward._id} className="card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{ward.name}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {ward.type}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn("text-xs", getWardStatusColor(ward.status))}
                      >
                        {ward.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Total Beds</p>
                        <p className="font-semibold">{ward.totalBeds}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Floor</p>
                        <p className="font-semibold">{ward.floor}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Daily Rate</p>
                        <p className="font-semibold">${ward.dailyRate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---------- Beds Tab ---------- */}
        <TabsContent value="beds">
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={bedStatusFilter} onValueChange={setBedStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Occupied">Occupied</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {filteredBeds.length} bed{filteredBeds.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredBeds.length === 0 ? (
                  <div className="text-center py-12">
                    <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No beds found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBeds.map((bed) => (
                      <div
                        key={bed._id}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                            <Bed className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">
                              Bed {bed.bedNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {"name" in bed.ward
                                ? (bed.ward as Ward).name
                                : "Unknown Ward"}{" "}
                              &bull; {bed.type}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge
                            className={cn(
                              "text-xs",
                              getBedStatusColor(bed.status)
                            )}
                          >
                            {bed.status}
                          </Badge>
                          {bed.lastSanitized && (
                            <span className="text-xs text-muted-foreground">
                              Sanitized: {formatDate(bed.lastSanitized)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------- Allocations Tab ---------- */}
        <TabsContent value="allocations">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Active Allocations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : allocations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active allocations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allocations.map((alloc) => (
                    <div
                      key={alloc._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0">
                          {alloc.patient?.firstName?.[0]}
                          {alloc.patient?.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {alloc.patient?.firstName} {alloc.patient?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bed {alloc.bed?.bedNumber} &bull; Dr.{" "}
                            {alloc.doctor?.firstName} {alloc.doctor?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Admitted: {formatDate(alloc.admissionDate)}
                            {alloc.expectedDischarge && (
                              <>
                                {" "}
                                &bull; Expected Discharge:{" "}
                                {formatDate(alloc.expectedDischarge)}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={cn(
                            "text-xs",
                            getAllocationStatusColor(alloc.status)
                          )}
                        >
                          {alloc.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        {alloc.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleAccept(alloc._id)}
                          >
                            Accept
                          </Button>
                        )}
                        {(alloc.status === "Active" ||
                          alloc.status === "Pending") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDischarge(alloc._id)}
                          >
                            Discharge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ====== Add Ward Dialog ====== */}
      <Dialog open={wardDialogOpen} onOpenChange={setWardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Ward</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWard} className="space-y-4">
            <div className="space-y-2">
              <Label>Ward Name</Label>
              <Input
                placeholder="e.g. General Ward A"
                value={wardForm.name}
                onChange={(e) =>
                  setWardForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={wardForm.type}
                  onValueChange={(v) =>
                    setWardForm((f) => ({ ...f, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                    <SelectItem value="Surgical">Surgical</SelectItem>
                    <SelectItem value="Psychiatric">Psychiatric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Beds</Label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={wardForm.totalBeds}
                  onChange={(e) =>
                    setWardForm((f) => ({ ...f, totalBeds: e.target.value }))
                  }
                  required
                  min={1}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={wardForm.floor}
                  onChange={(e) =>
                    setWardForm((f) => ({ ...f, floor: e.target.value }))
                  }
                  required
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Daily Rate ($)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 150"
                  value={wardForm.dailyRate}
                  onChange={(e) =>
                    setWardForm((f) => ({ ...f, dailyRate: e.target.value }))
                  }
                  required
                  min={0}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting ? "Creating..." : "Create Ward"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ====== Add Bed Dialog ====== */}
      <Dialog open={bedDialogOpen} onOpenChange={setBedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bed</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBed} className="space-y-4">
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select
                value={bedForm.ward}
                onValueChange={(v) =>
                  setBedForm((f) => ({ ...f, ward: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w._id} value={w._id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bed Number</Label>
                <Input
                  placeholder="e.g. A-101"
                  value={bedForm.bedNumber}
                  onChange={(e) =>
                    setBedForm((f) => ({ ...f, bedNumber: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bed Type</Label>
                <Select
                  value={bedForm.type}
                  onValueChange={(v) =>
                    setBedForm((f) => ({ ...f, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="Bariatric">Bariatric</SelectItem>
                    <SelectItem value="Pediatric">Pediatric</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBedDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting ? "Creating..." : "Create Bed"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
