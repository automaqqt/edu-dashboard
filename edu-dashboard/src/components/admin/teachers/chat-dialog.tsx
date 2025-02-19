"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
})

interface Message {
  id: string
  content: string
  createdAt: string
  isFromAdmin: boolean
  user: {
    name: string
    role: string
  }
}

interface Teacher {
  id: string
  name: string
  hasNewMessage: boolean
}

interface ChatDialogProps {
  teacher: Teacher
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessageRead: () => void
}

export function ChatDialog({
  teacher,
  open,
  onOpenChange,
  onMessageRead
}: ChatDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

  // Mark messages as read when dialog opens
  useEffect(() => {
    if (open) {
      const markAsRead = async () => {
        try {
          await fetch(`/api/admin/messages/read/${teacher.id}`, { method: "POST" })
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["messages", teacher.id] })
          queryClient.invalidateQueries({ queryKey: ["teachers"] })
          if (onMessageRead) onMessageRead()
        } catch (error) {
          console.error("Failed to mark messages as read:", error)
        }
      }
      markAsRead()
    }
  }, [open, teacher.id, teacher.hasNewMessage, queryClient, onMessageRead])

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["messages", teacher.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/messages?teacherId=${teacher.id}`)
      if (!response.ok) throw new Error("Failed to fetch messages")
      return response.json()
    },
    enabled: open,
    refetchInterval: open ? 3000 : false, // Poll every 3 seconds when dialog is open
  })

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          teacherId: teacher.id,
        }),
      })
      if (!response.ok) throw new Error("Failed to send message")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", teacher.id] })
      form.reset()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values.content)
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chat with {teacher.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">Loading messages...</div>
              ) : messages?.length === 0 ? (
                <div className="flex justify-center py-4 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages?.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col ${
                      message.isFromAdmin
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.isFromAdmin
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()} by {message.user.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Textarea
                          placeholder="Type your message..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}