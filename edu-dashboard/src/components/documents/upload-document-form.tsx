"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { DialogClose } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fileUrl: z.string().min(1, "File is required"),
})

type FormValues = z.infer<typeof formSchema>

export function UploadDocumentForm() {
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      fileUrl: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          type: "PERSONAL",
          fileSize: 0, // This will be updated by the API based on the actual file size
        }),
      })

      if (!response.ok) throw new Error("Failed to upload document")

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      
      // Refresh the page to show new document
      router.refresh()
      
      // Reset form
      form.reset()
      
      // Close dialog
      //@ts-ignore
      document.querySelector("[data-dialog-close]")?.click()
      router.push('/dashboard/documents')
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    }
  }

  return (
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
              <FormLabel>File</FormLabel>
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
        <div className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Upload</Button>
        </div>
      </form>
    </Form>
  )
}