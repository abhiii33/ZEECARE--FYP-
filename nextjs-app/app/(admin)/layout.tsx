"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { useEffect, useState } from "react";
import { getAdminProfile } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        const { firstName, lastName } = res.data.user;
        setAdminName(`${firstName} ${lastName}`);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar adminName={adminName} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
