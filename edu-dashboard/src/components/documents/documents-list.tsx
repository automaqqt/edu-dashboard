"use client"

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
import { Download, Trash2, Search } from "lucide-react"
import { formatBytes } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileSize: number
  type: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
  }
}

export function DocumentsList() {
  const [search, setSearch] = useState("")

  const { data: documents, refetch } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents")
      if (!response.ok) throw new Error("Failed to fetch documents")
      return response.json()
    }
  })

  const filteredDocuments = documents?.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Größe</TableHead>
              <TableHead>Zuletzt geändert</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments?.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>
                  <Badge variant={doc.type === "SHARED_ADMIN" ? "secondary" : "default"}>
                    {doc.type === "SHARED_ADMIN" ? "Admin Shared" : "Personal"}
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
                    
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}