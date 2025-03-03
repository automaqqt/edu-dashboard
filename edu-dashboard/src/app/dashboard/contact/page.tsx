"use client"

import { useEffect } from "react"
import { ContactInfo } from "@/components/contact/contact-info"
import { ChatWindow } from "@/components/contact/chat-window"
import { useQueryClient } from "@tanstack/react-query"

export default function ContactPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Mark messages as read when page is opened
    const markAsRead = async () => {
      try {
        await fetch("/api/messages/read", { method: "POST" })
        queryClient.invalidateQueries({ queryKey: ["user-status"] })
      } catch (error) {
        console.error("Failed to mark messages as read:", error)
      }
    }
    markAsRead()
  }, [queryClient])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kontakt</h1>
        <p className="text-muted-foreground">
          Kontaktinformationen und live chat
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ContactInfo />
        <ChatWindow />
      </div>
    </div>
  )
}