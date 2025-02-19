"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

  if (isLoading) {
    return <Skeleton />
  }

  return (
    <div className="space-y-4">
      {announcements?.map((announcement) => (
        <Card key={announcement.id}>
          <CardHeader>
            <CardTitle>{announcement.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            <p>{announcement.content}</p>
            {announcement.fileUrl && (
              <a
                href={announcement.fileUrl}
                className="text-primary hover:underline mt-2 inline-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                View attachment
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}