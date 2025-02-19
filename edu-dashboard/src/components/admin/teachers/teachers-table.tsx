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
import { Badge } from "@/components/ui/badge"
import { EditTeacherDialog } from "./edit-teacher-dialog"
import { ChatDialog } from "./chat-dialog"
import { Button } from "@/components/ui/button"
import { MessageSquare, Pencil, Trash2, Mail, BellRing } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Teacher {
  id: string
  name: string
  email: string
  isActive: boolean
  unreadMessageCount: number
  lastLoginAt: string | null
  createdAt: string
  gruppenanzahl: number | null
  teilnehmeranzahl: number | null
  notes: string | null
  hasNewMessage: boolean
  hasNewAnnouncement: boolean
}

export function TeachersTable() {
  const { toast } = useToast()
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: teachers, refetch } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/teachers")
      if (!response.ok) throw new Error("Failed to fetch teachers")
      return response.json()
    },
  })

  const handleDelete = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete teacher")

      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      })
    }
  }

  const handleOpenChat = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsChatOpen(true)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers?.map((teacher) => (
            <TableRow 
              key={teacher.id}
              className={(teacher.unreadMessageCount > 0 && teacher.hasNewMessage == false) ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}
            >
              <TableCell className="font-medium">{teacher.name}</TableCell>
              <TableCell>{teacher.email}</TableCell>
              <TableCell>{teacher.gruppenanzahl || "-"}</TableCell>
              <TableCell>{teacher.teilnehmeranzahl || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {(teacher.unreadMessageCount > 0 && teacher.hasNewMessage == false) && (
                    <Badge variant="destructive" className="flex gap-1">
                      <Mail className="h-3 w-3" />
                      {teacher.unreadMessageCount > 0 && teacher.unreadMessageCount}
                      New Message
                    </Badge>
                  )}
                  {teacher.hasNewAnnouncement && (
                    <Badge variant="default" className="flex gap-1">
                      <BellRing className="h-3 w-3" />
                      New
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant={(teacher.unreadMessageCount > 0 && teacher.hasNewMessage == false) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleOpenChat(teacher)}
                    className={cn(
                        (teacher.unreadMessageCount > 0 && teacher.hasNewMessage == false) && "bg-primary text-primary-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTeacher(teacher)
                      setIsEditOpen(true)
                    }}
                  >
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
                        <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this teacher? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(teacher.id)}
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

      {selectedTeacher && (
        <>
          <ChatDialog
            teacher={selectedTeacher}
            open={isChatOpen}
            onOpenChange={setIsChatOpen}
            onMessageRead={refetch}
          />
          <EditTeacherDialog
            teacher={selectedTeacher}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            onSuccess={refetch}
          />
        </>
      )}
    </div>
  )
}