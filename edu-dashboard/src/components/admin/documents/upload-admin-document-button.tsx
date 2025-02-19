"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fileUrl: z.string().min(1, "File is required"),
  teacherIds: z.array(z.string()).default([]),
})

export function UploadAdminDocumentButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fileUrl: "",
      teacherIds: [],
    },
  })
  interface Teacher {
    id: string
    name: string
    email: string
  }
  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teachers")
      if (!response.ok) throw new Error("Failed to fetch teachers")
      return response.json()
    },
  })
  const selectedTeacherIds = form.watch("teacherIds")
  const handleTeacherSelect = (teacherId: string) => {
    const currentIds = form.getValues("teacherIds")
    if (currentIds.includes(teacherId)) {
      form.setValue("teacherIds", currentIds.filter(id => id !== teacherId))
    } else {
      form.setValue("teacherIds", [...currentIds, teacherId])
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/admin/documents/shared", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to upload document")

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] })
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Shared Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Shared Document</DialogTitle>
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
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document</FormLabel>
                  <FormControl>
                    <FileUpload
                      endpoint="documents"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}