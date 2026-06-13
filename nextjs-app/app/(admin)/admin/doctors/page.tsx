"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, Stethoscope, Star } from "lucide-react";
import { getAllDoctors } from "@/lib/api";
import Link from "next/link";
import type { User } from "@/types";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllDoctors()
      .then((res) => setDoctors(res.data.doctors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) => {
    const name = `${d.firstName} ${d.lastName} ${d.doctorDepartment}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="text-muted-foreground text-sm">Manage your medical staff</p>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/admin/add-doctor">
            <UserPlus className="mr-2 h-4 w-4" />Add Doctor
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search doctors..." className="pl-9" value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6 text-center">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <Card key={doc._id} className="card-hover text-center">
              <CardContent className="p-6">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={doc.docAvatar?.url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {doc.firstName[0]}{doc.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">Dr. {doc.firstName} {doc.lastName}</h3>
                <Badge variant="secondary" className="mb-3 text-xs">{doc.doctorDepartment}</Badge>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-3 w-3 ${i <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{doc.email}</p>
                  <p>{doc.gender} • {doc.phone}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No doctors found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
