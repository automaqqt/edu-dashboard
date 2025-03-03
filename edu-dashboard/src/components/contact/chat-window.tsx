"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  content: string
  createdAt: string
  isFromAdmin: boolean
  user: {
    name: string | null
  }
}

export function ChatWindow() {
  const [message, setMessage] = useState("")
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await fetch(`/api/messages`)
      return response.json()
    },
    refetchInterval: 5000, // Poll every 5 seconds
  })

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] })
      setMessage("")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    mutation.mutate(message)
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Betreuer Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <div className="flex-1 overflow-hidden pr-4 pl-6 pt-2">
          <ScrollArea className="h-full">
            <div className="space-y-4 pb-2 pr-4">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.isFromAdmin
                      ? "items-start"
                      : "items-end"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.isFromAdmin
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <form onSubmit={handleSubmit} className="p-6 pt-0 mt-4">
          <div className="flex space-x-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="resize-none"
            />
            <Button type="submit" disabled={!message.trim()}>
              Senden
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}