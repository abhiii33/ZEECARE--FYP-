"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart, LayoutDashboard, Calendar, Stethoscope, MessageSquare,
  UserPlus, ShieldPlus, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/lib/api";
import { toast } from "sonner";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar, badge: "new" },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/add-doctor", label: "Add Doctor", icon: UserPlus },
  { href: "/admin/add-admin", label: "Add Admin", icon: ShieldPlus },
];

interface AdminSidebarProps {
  adminName?: string;
}

export default function AdminSidebar({ adminName = "Admin" }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
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
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
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

      {/* Navigation */}
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
                    ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-400 border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <link.icon className={cn("h-5 w-5 shrink-0", isActive && "text-purple-400")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <Badge variant="default" className="h-5 text-[10px] px-1.5 bg-purple-600">
                        {link.badge}
                      </Badge>
                    )}
                    {isActive && <ChevronRight className="h-3 w-3" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-purple-600 text-white text-xs">
                {adminName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminName}</p>
              <p className="text-xs text-gray-400">Administrator</p>
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
