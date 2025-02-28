"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient, useMutation } from "@tanstack/react-query"

interface Folder {
  id: string
  name: string
  description?: string | null
}

interface EditFolderDialogProps {
  folder: Folder
  trigger: React.ReactNode
}

const formSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
});

export function EditFolderDialog({ folder, trigger }: EditFolderDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder.name,
      description: folder.description || "",
    },
  });

  const editFolderMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch(`/api/admin/folders/${folder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to update folder");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Folder updated successfully",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update folder",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    editFolderMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Folder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={editFolderMutation.isPending}
              >
                {editFolderMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}