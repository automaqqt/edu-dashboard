"use client"

import Link from "next/link"
import Image from "next/image"
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
      color: "text-violet-300",
    },
    {
      label: "Trainingskonzept",
      icon: FileText,
      href: "/dashboard/training",
      color: "text-violet-300",
    },
    {
      label: "Ankündigungen",
      icon: Bell,
      href: "/dashboard/announcements",
      color: "text-violet-300",
      notification: userStatus?.hasNewAnnouncement
    },
    {
      label: "Unterlagen",
      icon: FolderOpen,
      href: "/dashboard/documents",
      color: "text-violet-300",
    },
    {
      label: "Kontakt",
      icon: MessageSquare,
      href: "/dashboard/contact",
      color: "text-violet-300",
      notification: userStatus?.hasNewMessage
    },
  ]

  // Admin routes
  const adminRoutes = [
    {
      label: "Admin Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/admin",
      color: "text-violet-300",
    },
    {
      label: "Teachers",
      icon: Users,
      href: "/dashboard/admin/teachers",
      color: "text-violet-300",
      notification: userStatus?.hasNewMessage
    },
    {
      label: "Training Materials",
      icon: FileText,
      href: "/dashboard/admin/training",
      color: "text-violet-300",
    },
    {
      label: "Announcements",
      icon: Bell,
      href: "/dashboard/admin/announcements",
      color: "text-violet-300",
    },
    {
      label: "Documents",
      icon: FolderOpen,
      href: "/dashboard/admin/documents",
      color: "text-violet-300",
    },
  ]

  const routes = isAdmin ? adminRoutes : teacherRoutes

  return (
    <div className="flex flex-col h-full">
      {/* White header section with logo */}
      <div className="bg-gray-100 py-6 flex justify-center items-center border-b border-violet-200">
        <Link href="/dashboard">
          {/* Replace with your actual logo */}
          <div className="relative w-40 h-20">
            <Image 
              src="/logo.webp" 
              alt="mitteinandermatt Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
      
      {/* Violet sidebar content */}
      <div className="flex-1 bg-violet-900 py-4">
        <div className="px-3 py-2 space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-violet-800 rounded-lg transition",
                pathname === route.href ? "text-white bg-violet-800" : "text-violet-100"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
                {route.notification && (
                  <AlertTriangle className="ml-2 h-4 w-4 text-yellow-300 shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}