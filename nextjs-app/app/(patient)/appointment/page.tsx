"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Stethoscope, CheckCircle } from "lucide-react";
import { getAllDoctors, bookAppointment } from "@/lib/api";
import { toast } from "sonner";
import type { User as UserType } from "@/types";

const departments = [
  "Pediatrics", "Orthopedics", "Cardiology", "Neurology",
  "Oncology", "Radiology", "Physical Therapy", "Dermatology", "ENT",
];

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
];

const steps = ["Patient Info", "Department & Doctor", "Date & Time", "Confirm"];

export default function AppointmentPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", NIC: "",
    DOB: "", gender: "", address: "", department: "", doctorId: "",
    appointment_date: "", hasVisited: false,
  });

  useEffect(() => {
    getAllDoctors().then((res) => setDoctors(res.data.doctors));
  }, []);

  const filteredDoctors = form.department
    ? doctors.filter((d) => d.doctorDepartment === form.department)
    : [];

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dateTime = new Date(`${form.appointment_date} ${selectedTime}`);
      await bookAppointment({ ...form, appointment_date: dateTime.toISOString() });
      toast.success("Appointment booked successfully! You'll receive a confirmation shortly.");
      setStep(0);
      setForm({
        firstName: "", lastName: "", email: "", phone: "", NIC: "",
        DOB: "", gender: "", address: "", department: "", doctorId: "",
        appointment_date: "", hasVisited: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Easy Booking</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Complete the steps below to schedule your appointment with our specialists.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span className="text-xs mt-1 font-medium hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 mx-2 transition-all ${
                    i < step ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 0 && <><User className="h-5 w-5 text-primary" />Patient Information</>}
              {step === 1 && <><Stethoscope className="h-5 w-5 text-primary" />Select Department & Doctor</>}
              {step === 2 && <><Calendar className="h-5 w-5 text-primary" />Choose Date & Time</>}
              {step === 3 && <><CheckCircle className="h-5 w-5 text-primary" />Confirm Appointment</>}
            </CardTitle>
            <CardDescription>
              {step === 0 && "Please provide your personal information"}
              {step === 1 && "Choose your preferred department and doctor"}
              {step === 2 && "Select your preferred appointment date and time"}
              {step === 3 && "Review and confirm your appointment details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Step 0: Patient Info */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@example.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="1234567890" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NIC Number</Label>
                    <Input placeholder="1234567890123" value={form.NIC}
                      onChange={(e) => setForm({ ...form, NIC: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={form.DOB}
                      onChange={(e) => setForm({ ...form, DOB: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input placeholder="Your address" value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="hasVisited" checked={form.hasVisited}
                    onChange={(e) => setForm({ ...form, hasVisited: e.target.checked })}
                    className="rounded" />
                  <Label htmlFor="hasVisited">I have visited this hospital before</Label>
                </div>
              </>
            )}

            {/* Step 1: Department & Doctor */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v, doctorId: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.department && (
                  <div className="space-y-2">
                    <Label>Doctor</Label>
                    {filteredDoctors.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                        No doctors available for this department.
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {filteredDoctors.map((doc) => (
                          <div
                            key={doc._id}
                            onClick={() => setForm({ ...form, doctorId: doc._id })}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              form.doctorId === doc._id
                                ? "border-primary bg-primary/5"
                                : "hover:border-primary/50 hover:bg-muted"
                            }`}
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                              {doc.firstName[0]}{doc.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium">Dr. {doc.firstName} {doc.lastName}</p>
                              <p className="text-xs text-muted-foreground">{doc.doctorDepartment}</p>
                            </div>
                            {form.doctorId === doc._id && (
                              <CheckCircle className="ml-auto h-5 w-5 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.appointment_date}
                    onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-4 w-4" />Select Time Slot</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                          selectedTime === slot
                            ? "bg-primary text-primary-foreground border-primary"
                            : "hover:border-primary hover:text-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-3">
                  <h3 className="font-semibold text-primary">Appointment Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Patient:</span> <span className="font-medium">{form.firstName} {form.lastName}</span></div>
                    <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{form.email}</span></div>
                    <div><span className="text-muted-foreground">Department:</span> <span className="font-medium">{form.department}</span></div>
                    <div><span className="text-muted-foreground">Doctor:</span> <span className="font-medium">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span></div>
                    <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{form.appointment_date}</span></div>
                    <div><span className="text-muted-foreground">Time:</span> <span className="font-medium">{selectedTime}</span></div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  By confirming, you agree to our appointment policy. You&apos;ll receive a confirmation email within minutes.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  variant="gradient"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 0 && (!form.firstName || !form.lastName || !form.email || !form.phone || !form.gender)) ||
                    (step === 1 && (!form.department || !form.doctorId)) ||
                    (step === 2 && (!form.appointment_date || !selectedTime))
                  }
                >
                  Continue
                </Button>
              ) : (
                <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Booking..." : "Confirm Appointment"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
