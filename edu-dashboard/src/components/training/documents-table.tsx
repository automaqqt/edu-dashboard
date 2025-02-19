"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import { cn, formatBytes } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Document {
  id: string
  title: string
  skillLevel: number
  fileUrl: string
  fileSize: number
  requirements?: string
  updatedAt: string
}

interface DocumentsTableProps {
  documents: Document[]
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

export function DocumentsTable({ documents }: DocumentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                {doc.title}
                {doc.requirements && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="ml-2">
                          Requirements
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{doc.requirements}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
              <TableCell>
                <Badge className={cn("text-white", getSkillLevelColor(doc.skillLevel))}>
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
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}