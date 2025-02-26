import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminStatsCards } from "@/components/admin/dashboard/stats-card"
import { TeacherStatsTable } from "@/components/admin/dashboard/teacher-stats-table"
import { db } from "@/lib/db"

async function getAdminStats() {
  const teachers = await db.user.findMany({
    where: { role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      gruppenanzahl: true,
      teilnehmeranzahl: true,
      lastLoginAt: true,
    }
  })

  const totals = teachers.reduce((acc: { totalGroups: any; totalParticipants: any }, teacher: { gruppenanzahl: any; teilnehmeranzahl: any, lastLoginAt:any }) => ({
    totalGroups: acc.totalGroups + (teacher.gruppenanzahl || 0),
    totalParticipants: acc.totalParticipants + (teacher.teilnehmeranzahl || 0),
  }), { totalGroups: 0, totalParticipants: 0 })

  return {
    teachers,
    ...totals,
    totalTeachers: teachers.length
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== "ADMIN") return null

  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all teacher statistics
        </p>
      </div>
      <AdminStatsCards stats={stats} />
      <div>
        <h2 className="text-xl font-semibold mb-4">Teacher Statistics</h2>
        <TeacherStatsTable teachers={stats.teachers} />
      </div>
    </div>
  )
}