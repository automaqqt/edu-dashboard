"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FolderPlus } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient, useQuery } from "@tanstack/react-query"

interface Folder {
  subFolders: Folder[]
  id: string
  name: string
  description?: string
  parentId?: string | null
}

// Recursive function to get all nested folders
function getAllFolders(folders: Folder[]): Folder[] {
  let allFolders: Folder[] = []
  
  function traverse(folder: Folder) {
    allFolders.push(folder)
    if (folder.subFolders) {
      folder.subFolders.forEach(traverse)
    }
  }
  
  folders.forEach(traverse)
  return allFolders
}

// Function to build folder path
function getFolderPath(folders: Folder[], folderId: string): string {
  const paths: string[] = []
  let currentId = folderId

  while (currentId) {
    const folder = folders.find(f => f.id === currentId)
    if (!folder) break
    paths.unshift(folder.name)
    currentId = folder.parentId || ""
  }

  return paths.join(" / ")
}

const formSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
  parentId: z.string().nullable(),
})

export function AddFolderButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: folders } = useQuery<Folder[]>({
    queryKey: ["training-folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      return response.json()
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/admin/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      toast({
        title: "Success",
        description: "Folder created successfully",
      })
      
      queryClient.invalidateQueries({ queryKey: ["training-folders"] })
      setOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  const allFolders = folders ? getAllFolders(folders) : []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
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
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Folder</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || "root"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="root">Root Directory</SelectItem>
                      {allFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {getFolderPath(allFolders, folder.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit">Create Folder</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}