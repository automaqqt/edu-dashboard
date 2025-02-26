"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface Announcement{
  id:number,
  title: string,
  createdAt:number,
  content: string,
  fileUrl: string,
}

export function AnnouncementsList() {
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await fetch("/api/announcements")
      return response.json()
    }
  })

  const handlePrint = (fileUrl: string) => {
    window.open(fileUrl, '_blank')?.print()
  }

  if (isLoading) {
    return <Skeleton />
  }

  return (
    <div className="space-y-4">
      {announcements?.map((announcement) => (
        <Card key={announcement.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{announcement.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </div>
            </div>
            {announcement.fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => handlePrint(announcement.fileUrl)}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <p>{announcement.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}