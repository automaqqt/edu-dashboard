import { AnnouncementsAdmin } from "@/components/admin/announcements/announcements-admin"
import { CreateAnnouncementAdminButton } from "@/components/admin/announcements/create-announcement-admin-button"

export default function AnnouncementsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage announcements for teachers
          </p>
        </div>
        <CreateAnnouncementAdminButton />
      </div>
      <AnnouncementsAdmin />
    </div>
  )
}