"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Bell,
  FolderOpen,
  MessageSquare,
  LayoutDashboard,
  AlertTriangle,
  Users
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  // Fetch user status for notifications
  const { data: userStatus } = useQuery({
    queryKey: ["user-status"],
    queryFn: async () => {
      const response = await fetch("/api/user/status")
      if (!response.ok) throw new Error("Failed to fetch user status")
      return response.json()
    },
    enabled: !!session,
    refetchInterval: 15000 // Refetch every 15 seconds
  })

  // Teacher routes
  const teacherRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Trainingskonzept",
      icon: FileText,
      href: "/dashboard/training",
      color: "text-violet-500",
    },
    {
      label: "Ankündigungen",
      icon: Bell,
      href: "/dashboard/announcements",
      color: "text-pink-700",
      notification: userStatus?.hasNewAnnouncement
    },
    {
      label: "Unterlagen",
      icon: FolderOpen,
      href: "/dashboard/documents",
      color: "text-orange-700",
    },
    {
      label: "Kontakt",
      icon: MessageSquare,
      href: "/dashboard/contact",
      color: "text-emerald-500",
      notification: userStatus?.hasNewMessage
    },
  ]

  // Admin routes
  const adminRoutes = [
    {
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
      color: "text-sky-500",
    },
    {
      label: "Teachers",
      icon: Users,
      href: "/dashboard/admin/teachers",
      color: "text-blue-500",
      notification: userStatus?.hasNewMessage
    },
    {
      label: "Training Materials",
      icon: FileText,
      href: "/dashboard/admin/training",
      color: "text-violet-500",
    },
    {
      label: "Announcements",
      icon: Bell,
      href: "/dashboard/admin/announcements",
      color: "text-pink-700",
    },
    {
      label: "Documents",
      icon: FolderOpen,
      href: "/dashboard/admin/documents",
      color: "text-orange-700",
    },
  ]

  const routes = isAdmin ? adminRoutes : teacherRoutes

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">EduDashboard</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
                {route.notification && (
                  <AlertTriangle className="ml-2 h-4 w-4 text-yellow-500 shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
