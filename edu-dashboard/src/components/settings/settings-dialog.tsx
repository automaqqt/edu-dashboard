"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  gruppenanzahl: z.string()
    .transform(v => (v === "" ? null : parseInt(v, 10)))
    .refine(v => v === null || (v >= 0 && v <= 100), {
      message: "Number of groups must be between 0 and 100",
    }),
  teilnehmeranzahl: z.string()
    .transform(v => (v === "" ? null : parseInt(v, 10)))
    .refine(v => v === null || (v >= 0 && v <= 1000), {
      message: "Number of participants must be between 0 and 1000",
    }),
})

type FormValues = {
  gruppenanzahl: string;
  teilnehmeranzahl: string;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast()
  const { data: session, update } = useSession()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      //@ts-ignore
      gruppenanzahl: session?.user?.gruppenanzahl?.toString() ?? "",
      //@ts-ignore
      teilnehmeranzahl: session?.user?.teilnehmeranzahl?.toString() ?? "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gruppenanzahl: values.gruppenanzahl ? parseInt(values.gruppenanzahl) : null,
          teilnehmeranzahl: values.teilnehmeranzahl ? parseInt(values.teilnehmeranzahl) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })

      // Update the session with new values
      await update()
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gruppenanzahl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Groups</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Enter number of groups"
                      {...field}
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
                      min={0}
                      max={1000}
                      placeholder="Enter number of participants"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {onOpenChange(false)}}
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