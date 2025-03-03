"use client"

import { useEffect } from "react"
import { AnnouncementsList } from "@/components/announcements/announcements-list"
import { useQueryClient } from "@tanstack/react-query"

export default function AnnouncementsPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Mark announcements as read when page is opened
    const markAsRead = async () => {
      try {
        await fetch("/api/announcements/read", { method: "POST" })
        queryClient.invalidateQueries({ queryKey: ["user-status"] })
      } catch (error) {
        console.error("Failed to mark announcements as read:", error)
      }
    }
    markAsRead()
  }, [queryClient])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ankündigungen</h1>
        
      </div>
      <AnnouncementsList />
    </div>
  )
}