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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Users } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Announcement {
  id: string
  title: string
  content: string
  fileUrl: string | null
  isGlobal: boolean
  createdAt: string
  updatedAt: string
  recipients: { id: string; name: string }[]
}

export function AnnouncementsAdmin() {
  const { toast } = useToast()

  const { data: announcements, refetch } = useQuery<Announcement[]>({
    queryKey: ["announcements-admin"],
    queryFn: async () => {
      const response = await fetch("/api/admin/announcements")
      if (!response.ok) throw new Error("Failed to fetch announcements")
      return response.json()
    },
  })

  const handleDelete = async (announcementId: string) => {
    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete announcement")

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {announcements?.map((announcement) => (
          <TableRow key={announcement.id}>
            <TableCell className="font-medium">{announcement.title}</TableCell>
            <TableCell>
              <Badge variant={announcement.isGlobal ? "default" : "secondary"}>
                {announcement.isGlobal ? "Global" : "Targeted"}
              </Badge>
            </TableCell>
            <TableCell>
              {announcement.isGlobal ? (
                "All Teachers"
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        {announcement.recipients.length} Teachers
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{announcement.recipients.map(r => r.name).join(", ")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TableCell>
            <TableCell>
              {new Date(announcement.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this announcement? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(announcement.id)}
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
  )
}