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
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder,
  Info,
} from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PrintButton } from "../ui/print-button"

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

function getSkillLevelColor(level: number) {
  switch (level) {
    case 1:
      return "bg-green-500"
    case 2:
      return "bg-blue-500"
    case 3:
      return "bg-yellow-500"
    case 4:
      return "bg-orange-500"
    case 5:
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

function DocumentsTable({ documents }: { documents: Document[] }) {
  if (!documents || documents.length === 0) {
    return null;
  }

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
              <TableHead>Requirements</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[100px]">Print</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {doc.title}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(
                    "text-white",
                    getSkillLevelColor(doc.skillLevel)
                  )}>
                    Level {doc.skillLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                <p className="max-w-xs whitespace-normal">{doc.requirements}</p>
                </TableCell>
                <TableCell>
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                    <PrintButton fileUrl={doc.fileUrl}/>
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
      <Button
        variant="ghost"
        className="w-full justify-start hover:bg-accent"
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
        <span className="flex-1 text-left">{folder.name}</span>
        {folder.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{folder.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Button>

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

export function TrainingDocuments() {
  const { data: folders, isLoading } = useQuery<Folder[]>({
    queryKey: ["training-folders"],
    queryFn: async () => {
      const response = await fetch("/api/training/folders")
      if (!response.ok) throw new Error("Failed to fetch training documents")
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading training materials...</p>
      </div>
    )
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">No training materials available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {folders.map((folder) => (
        <FolderTree
          key={folder.id}
          folder={folder}
        />
      ))}
    </div>
  )
}