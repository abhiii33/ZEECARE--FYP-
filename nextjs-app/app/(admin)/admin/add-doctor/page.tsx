"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, UserPlus, Eye, EyeOff } from "lucide-react";
import { addDoctor } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const departments = [
  "Pediatrics", "Orthopedics", "Cardiology", "Neurology",
  "Oncology", "Radiology", "Physical Therapy", "Dermatology", "ENT",
];

export default function AddDoctorPage() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", NIC: "",
    DOB: "", gender: "", password: "", doctorDepartment: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (avatar) data.append("docAvatar", avatar);
      await addDoctor(data);
      toast.success("Doctor added successfully!");
      router.push("/admin/doctors");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Add New Doctor</h1>
        <p className="text-muted-foreground text-sm">Register a new doctor to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Information</CardTitle>
          <CardDescription>Fill in the details to register a new doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={preview} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {form.firstName ? form.firstName[0] : "D"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary flex items-center justify-center"
                >
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium">Doctor Photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP, max 5MB</p>
                <Button type="button" variant="outline" size="sm" className="mt-2"
                  onClick={() => fileRef.current?.click()}>
                  Upload Photo
                </Button>
              </div>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Smith" value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="doctor@zeecare.health" value={form.email}
                onChange={(e) => update("email", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="1234567890" value={form.phone}
                  onChange={(e) => update("phone", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>NIC Number</Label>
                <Input placeholder="1234567890123" value={form.NIC}
                  onChange={(e) => update("NIC", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" value={form.DOB}
                  onChange={(e) => update("DOB", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.doctorDepartment} onValueChange={(v) => update("doctorDepartment", v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={loading}>
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Adding Doctor..." : "Add Doctor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
