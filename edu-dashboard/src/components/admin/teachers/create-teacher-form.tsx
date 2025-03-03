"use client"

import { useState } from "react"
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
import { useQueryClient } from "@tanstack/react-query"
import { Check, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

interface CreateTeacherFormProps {
  onSuccess: () => void
}

export function CreateTeacherForm({ onSuccess }: CreateTeacherFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create teacher")
      
      // Get the reset link from the response
      const resetUrl = await response.json()
      setResetLink(resetUrl)

      toast({
        title: "Success",
        description: "Teacher account created successfully",
      })
      
      queryClient.invalidateQueries({ queryKey: ["teachers"] })
      // Note: we're not calling onSuccess() here to keep the dialog open so the user can copy the link
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create teacher account",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = () => {
    if (resetLink) {
      try {
        // Try using the Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(resetLink)
        } else {
          // Fallback method using a temporary textarea element
          const textarea = document.createElement('textarea')
          textarea.value = resetLink
          textarea.style.position = 'fixed'  // Prevent scrolling to bottom
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        
        setCopied(true)
        toast({
          title: "Copied",
          description: "Reset link copied to clipboard",
        })
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy reset link",
          variant: "destructive",
        })
      }
    }
  }

  const handleClose = () => {
    setResetLink(null)
    form.reset()
    onSuccess()
  }

  return (
    <div>
      {resetLink ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription>
              Teacher account created successfully. Share this password reset link with the teacher:
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center space-x-2">
            <Input 
              value={resetLink} 
              readOnly 
              className="pr-10 font-mono text-sm"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="pt-2 flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      ) : (
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Teacher"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}