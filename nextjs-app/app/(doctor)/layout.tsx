"use client";

import DoctorSidebar from "@/components/layout/DoctorSidebar";
import { useEffect, useState } from "react";
import { getDoctorProfile } from "@/lib/api";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [doctorName, setDoctorName] = useState("Doctor");
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [department, setDepartment] = useState<string>();

  useEffect(() => {
    getDoctorProfile()
      .then((res) => {
        const { firstName, lastName, docAvatar, doctorDepartment } = res.data.user;
        setDoctorName(`${firstName} ${lastName}`);
        if (docAvatar?.url) setAvatarUrl(docAvatar.url);
        if (doctorDepartment) setDepartment(doctorDepartment);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <DoctorSidebar doctorName={doctorName} avatarUrl={avatarUrl} department={department} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
