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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient, useMutation } from "@tanstack/react-query"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileSize: number
  skillLevel: number
  requirements?: string
  updatedAt: string
  folderId: string
}

interface Folder {
  id: string
  name: string
  parentId: string | null
  subFolders?: Folder[]
}

interface MoveDocumentProps {
  document: Document
  allFolders: Folder[]
  currentFolderId: string
  trigger: React.ReactNode
}

// Function to get all folders flattened
function getAllFolders(folders: Folder[]): Folder[] {
  let allFolders: Folder[] = [];
  
  function traverse(folder: Folder) {
    allFolders.push(folder);
    if (folder.subFolders && folder.subFolders.length > 0) {
      folder.subFolders.forEach(subFolder => traverse(subFolder));
    }
  }
  
  folders.forEach(folder => traverse(folder));
  return allFolders;
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
  targetFolderId: z.string(),
});

export function MoveDocumentDialog({ document, allFolders, currentFolderId, trigger }: MoveDocumentProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetFolderId: currentFolderId,
    },
  });

  const moveDocumentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/admin/training/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          targetFolderId: values.targetFolderId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to move document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Document moved successfully",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move document",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    moveDocumentMutation.mutate(values);
  }

  // Prepare the folders data
  //const flattenedFolders = getAllFolders(allFolders);
  
  // Filter out folders - we might want to include all folders, even the current one
  // as the user might want to change the order within the same folder
  const availableFolders = allFolders;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Document</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="targetFolderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move "{document.title}" to:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination folder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFolders.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {getFolderPath(allFolders, f.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                disabled={moveDocumentMutation.isPending}
              >
                {moveDocumentMutation.isPending ? "Moving..." : "Move Document"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}