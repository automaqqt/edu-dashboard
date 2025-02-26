"use client"

import { useState, useMemo } from "react"
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
import { Download, Trash2, Search, FilterX } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { TeacherFilter } from "./teacher-filter" // Import the new component

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
    email: string
  }
}

export function TeacherDocumentsTable() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState<string | null>(null)

  const { data: documents, refetch, isLoading } = useQuery<Document[]>({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/documents/all")
      if (!response.ok) throw new Error("Failed to fetch documents")
      return response.json()
    }
  })

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete document")

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }
  console.log(documents)

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    if (!documents) return []
    
    // Create a map to store unique users by ID
    const userMap = new Map()
    
    documents.forEach(doc => {
      if (!userMap.has(doc.user.id)) {
        userMap.set(doc.user.id, doc.user)
      }
    })
    
    return Array.from(userMap.values())
  }, [documents])

  // Filter documents based on search and user filter
  const filteredDocuments = useMemo(() => {
    if (!documents) return []
    
    return documents.filter(doc => {
      const matchesSearch = 
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.user.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.user.email.toLowerCase().includes(search.toLowerCase())
      
      const matchesUser = !userFilter || doc.user.id === userFilter

      return matchesSearch && matchesUser
    })
  }, [documents, search, userFilter])

  const selectedTeacher = userFilter 
    ? uniqueUsers.find(user => user.id === userFilter)
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center gap-2">
          <TeacherFilter 
            users={uniqueUsers}
            selectedUserId={userFilter}
            onChange={setUserFilter}
          />
          
          {(search || userFilter) && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setSearch("")
                setUserFilter(null)
              }}
              title="Clear filters"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        
        
      </div>

      {userFilter && (
        <div className="text-sm text-muted-foreground">
          Showing documents from teacher: <span className="font-medium">{selectedTeacher?.name}</span>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No documents found
                  {(search || userFilter) && (
                    <span> with the current filters</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{doc.user.name}</TableCell>
                  <TableCell>{doc.type === "SHARED_ADMIN" ? "Admin Shared" : "Private"}</TableCell>
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
                              onClick={() => handleDelete(doc.id)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}