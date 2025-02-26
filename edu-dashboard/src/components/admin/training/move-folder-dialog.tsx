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

interface Folder {
  id: string
  name: string
  parentId: string | null
  subFolders?: Folder[]
}

interface MoveFolderProps {
  folder: Folder
  allFolders: Folder[]
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

// Function to check if a folder is a descendant of another folder
function isDescendant(folders: Folder[], potentialAncestorId: string, folderId: string): boolean {
  let currentId = folderId;
  
  while (currentId) {
    const folder = folders.find(f => f.id === currentId);
    if (!folder || !folder.parentId) break;
    
    if (folder.parentId === potentialAncestorId) {
      return true;
    }
    
    currentId = folder.parentId;
  }
  
  return false;
}

// Function to check if folderB is a descendant of folderA
function isFolderDescendantOf(allFolders: Folder[], folderAId: string, folderBId: string): boolean {
  const flattenedFolders = allFolders;
  
  // If it's the same folder, return true
  if (folderAId === folderBId) return true;
  
  // Find folderB
  const folderB = flattenedFolders.find(f => f.id === folderBId);
  if (!folderB) return false;
  
  // Check parent chain
  let currentParentId = folderB.parentId;
  while (currentParentId) {
    if (currentParentId === folderAId) return true;
    
    const parentFolder = flattenedFolders.find(f => f.id === currentParentId);
    if (!parentFolder) break;
    
    currentParentId = parentFolder.parentId;
  }
  
  return false;
}

const formSchema = z.object({
  newParentId: z.string(),
});

export function MoveFolderDialog({ folder, allFolders, trigger }: MoveFolderProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newParentId: folder.parentId || "root",
    },
  });

  const moveFolderMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/admin/folders/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderId: folder.id,
          newParentId: values.newParentId === "root" ? null : values.newParentId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to move folder");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-folders"] });
      toast({
        title: "Success",
        description: "Folder moved successfully",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move folder",
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    moveFolderMutation.mutate(values);
  }

  // Filter out the current folder and its descendants from the available target folders
  const availableFolders = allFolders.filter(f => {
    // Don't include the current folder
    if (f.id === folder.id) return false;
    
    // Don't include any descendants of the current folder
    return !isFolderDescendantOf(allFolders, folder.id, f.id);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Folder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newParentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move "{folder.name}" to:</FormLabel>
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
                      <SelectItem value="root">Root Directory</SelectItem>
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
                disabled={moveFolderMutation.isPending}
              >
                {moveFolderMutation.isPending ? "Moving..." : "Move Folder"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}