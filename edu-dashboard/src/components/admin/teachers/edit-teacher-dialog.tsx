"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  isActive: z.boolean(),
  gruppenanzahl: z.string().optional()
    .transform(v => (v === "" ? null : parseInt(v?v:"1", 10))),
  teilnehmeranzahl: z.string().optional()
    .transform(v => (v === "" ? null : parseInt(v?v:"1", 10))),
  notes: z.string().optional(),
})

type FormValues = {
  name: string;
  email: string;
  isActive: boolean;
  gruppenanzahl: string;
  teilnehmeranzahl: string;
  notes: string;
}

interface EditTeacherDialogProps {
  teacher: {
    id: string
    name: string
    email: string
    isActive: boolean
    gruppenanzahl: number | null
    teilnehmeranzahl: number | null
    notes: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: EditTeacherDialogProps) {
  const { toast } = useToast()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: teacher.name,
      email: teacher.email,
      isActive: teacher.isActive,
      gruppenanzahl: teacher.gruppenanzahl?.toString() ?? "",
      teilnehmeranzahl: teacher.teilnehmeranzahl?.toString() ?? "",
      notes: teacher.notes ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          gruppenanzahl: values.gruppenanzahl ? parseInt(values.gruppenanzahl) : null,
          teilnehmeranzahl: values.teilnehmeranzahl ? parseInt(values.teilnehmeranzahl) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update teacher")

      toast({
        title: "Success",
        description: "Teacher updated successfully",
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update teacher",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gruppenanzahl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Groups</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teilnehmeranzahl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Participants</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Account Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Active" : "Inactive"}
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
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}