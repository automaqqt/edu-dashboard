// File: src/components/admin/training/training-documents-admin.tsx
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder,
  Info
} from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { UploadTrainingButton } from "./upload-training-button"
import { AddFolderButton } from "./add-folder-button"

interface Document {
    id: string
    title: string
    fileUrl: string
    fileSize: number
    skillLevel: number
    requirements?: string
    updatedAt: string
  }
  
  interface Folder {
    id: string
    name: string
    description?: string
    documents: Document[]
    subFolders: Folder[]
    parentId: string | null
  }
  
  function DocumentsTable({ documents }: { documents: Document[] }) {
    const { toast } = useToast()
  
    if (!documents || documents.length === 0) {
      return null;
    }
  
    // Sort documents by updatedAt
    const sortedDocuments = [...documents].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Skill Level</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    {doc.title}
                    {doc.requirements && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="ml-2 h-4 w-4 text-muted-foreground inline-block" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs whitespace-normal">{doc.requirements}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-white",
                      doc.skillLevel <= 2 ? "bg-green-500" :
                      doc.skillLevel <= 4 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}>
                      Level {doc.skillLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatBytes(doc.fileSize)}</TableCell>
                  <TableCell>
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = doc.fileUrl
                          link.download = doc.title
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this document? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/admin/training/${doc.id}`, {
                                    method: "DELETE",
                                  })
                                  if (!response.ok) throw new Error("Failed to delete document")
                                  toast({
                                    title: "Success",
                                    description: "Document deleted successfully",
                                  })
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to delete document",
                                    variant: "destructive",
                                  })
                                }
                              }}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

function FolderTree({ folder }: { folder: Folder }) {
    const [isOpen, setIsOpen] = useState(false)
    const hasContents = (folder.documents?.length ?? 0) > 0 || (folder.subFolders?.length ?? 0) > 0
  
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="justify-start hover:bg-accent w-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            {hasContents ? (
              isOpen ? (
                <ChevronDown className="mr-2 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )
            ) : (
              <span className="w-4 mr-2" />
            )}
            {isOpen ? (
              <FolderOpen className="mr-2 h-4 w-4" />
            ) : (
              <Folder className="mr-2 h-4 w-4" />
            )}
            {folder.name}
            {folder.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-2 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{folder.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Button>
        </div>
  
        {isOpen && (
          <div className="pl-6 space-y-4">
            {folder.documents?.length > 0 && (
              <DocumentsTable documents={folder.documents} />
            )}
            {folder.subFolders?.map((subFolder) => (
              <FolderTree
                key={subFolder.id}
                folder={subFolder}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

export function TrainingDocumentsAdmin() {
  const { data: folders, isLoading } = useQuery<Folder[]>({
    queryKey: ["training-folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      return response.json()
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Training Materials</h2>
        <div className="flex gap-2">
          <AddFolderButton />
          <UploadTrainingButton />
        </div>
      </div>
      <div className="space-y-4">
        {folders?.map((folder) => (
          <FolderTree
            key={folder.id}
            folder={folder}
          />
        ))}
      </div>
    </div>
  )
}