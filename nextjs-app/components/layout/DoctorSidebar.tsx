"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart, LayoutDashboard, Calendar, ClipboardList, FileText,
  Pill, Clock, LogOut, Menu, X, ChevronRight, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutDoctor } from "@/lib/api";
import { toast } from "sonner";

const sidebarLinks = [
  { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/opd", label: "OPD Queue", icon: ClipboardList },
  { href: "/doctor/patients", label: "Patient Records", icon: Users },
  { href: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/doctor/schedule", label: "My Schedule", icon: Clock },
];

interface DoctorSidebarProps {
  doctorName?: string;
  avatarUrl?: string;
  department?: string;
}

export default function DoctorSidebar({ doctorName = "Doctor", avatarUrl, department }: DoctorSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutDoctor();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-950 text-white transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/doctor/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gradient">ZeeCare</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-800 ml-auto"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <link.icon className={cn("h-5 w-5 shrink-0", isActive && "text-emerald-400")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-emerald-600 text-white text-xs">
                {doctorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{doctorName}</p>
              <p className="text-xs text-gray-400">{department || "Doctor"}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "text-gray-400 hover:text-red-400 hover:bg-red-900/20 w-full",
            collapsed ? "px-2" : "justify-start"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
