"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Calendar, Filter } from "lucide-react";
import { getAllDoctors } from "@/lib/api";
import Link from "next/link";
import type { User } from "@/types";

const departments = ["All", "Pediatrics", "Orthopedics", "Cardiology", "Neurology", "Oncology", "Radiology", "Physical Therapy", "Dermatology", "ENT"];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  useEffect(() => {
    getAllDoctors()
      .then((res) => setDoctors(res.data.doctors))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) => {
    const name = `${d.firstName} ${d.lastName}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchDept = department === "All" || d.doctorDepartment === department;
    return matchSearch && matchDept;
  });

  return (
    <div className="py-12 bg-muted/30 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Our Team</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Meet Our Specialists</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse our team of experienced medical professionals and find the right specialist for your needs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-56">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing {filtered.length} doctor{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))
            : filtered.map((doc) => (
                <Card key={doc._id} className="card-hover text-center">
                  <CardContent className="p-6">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={doc.docAvatar?.url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        {doc.firstName[0]}{doc.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {doc.doctorDepartment}
                    </Badge>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-3 w-3 ${i <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
                    </div>
                    <Button variant="gradient" size="sm" className="w-full" asChild>
                      <Link href={`/appointment?doctor=${doc._id}&dept=${doc.doctorDepartment}`}>
                        <Calendar className="mr-2 h-3 w-3" />Book Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No doctors found matching your search.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setDepartment("All"); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
