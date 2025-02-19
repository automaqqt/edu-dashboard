// File: src/components/admin/announcements/create-announcement-admin-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Teacher {
  id: string
  name: string
  email: string
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  fileUrl: z.string().optional(),
  isGlobal: z.boolean().default(false),
  teacherIds: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

export function CreateAnnouncementAdminButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teachers")
      if (!response.ok) throw new Error("Failed to fetch teachers")
      return response.json()
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      fileUrl: "",
      isGlobal: false,
      teacherIds: [],
    },
  })

  const isGlobal = form.watch("isGlobal")
  const selectedTeacherIds = form.watch("teacherIds")

  const handleTeacherSelect = (teacherId: string) => {
    const currentIds = form.getValues("teacherIds")
    if (currentIds.includes(teacherId)) {
      form.setValue("teacherIds", currentIds.filter(id => id !== teacherId))
    } else {
      form.setValue("teacherIds", [...currentIds, teacherId])
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create announcement")

      toast({
        title: "Success",
        description: "Announcement created successfully",
      })
      
      queryClient.invalidateQueries({ queryKey: ["announcements-admin"] })
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachment (Optional)</FormLabel>
                  <FormControl>
                    <FileUpload
                      endpoint="announcements"
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isGlobal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Global Announcement</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Send to all teachers
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {!isGlobal && (
              <FormField
                control={form.control}
                name="teacherIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Recipients</FormLabel>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        {teachers?.map((teacher) => (
                          <Button
                            key={teacher.id}
                            type="button"
                            variant={selectedTeacherIds.includes(teacher.id) ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => handleTeacherSelect(teacher.id)}
                          >
                            {teacher.name}
                          </Button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeacherIds.map((id) => {
                          const teacher = teachers?.find(t => t.id === id)
                          if (!teacher) return null
                          return (
                            <Badge key={id} variant="secondary">
                              {teacher.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2"
                                onClick={() => handleTeacherSelect(id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}