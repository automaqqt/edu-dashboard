import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { StatsCards } from "@/components/dashboard/stats-card"
import { db } from "@/lib/db"
import { AdminStatsCards } from "@/components/admin/dashboard/stats-card"
import { TeacherStatsTable } from "@/components/admin/dashboard/teacher-stats-table"

async function getTeacherStats(teacherId: string) {
  // Get user stats
  const user = await db.user.findUnique({
    where: { id: teacherId },
    select: {
      gruppenanzahl: true,
      teilnehmeranzahl: true,
    }
  })

  // Get rankings
  const allTeachers = await db.user.findMany({
    where: { role: "TEACHER" },
    select: {
      id: true,
      gruppenanzahl: true,
      teilnehmeranzahl: true,
    }
  })

  // Sort for rankings (handle null values)
  const sortedByGroups = [...allTeachers]
    .filter(t => t.gruppenanzahl !== null)
    .sort((a, b) => (b.gruppenanzahl || 0) - (a.gruppenanzahl || 0))

  const sortedByParticipants = [...allTeachers]
    .filter(t => t.teilnehmeranzahl !== null)
    .sort((a, b) => (b.teilnehmeranzahl || 0) - (a.teilnehmeranzahl || 0))

  // Get rankings (+1 because array is 0-based)
  const groupRank = sortedByGroups.findIndex(t => t.id === teacherId) + 1
  const participantRank = sortedByParticipants.findIndex(t => t.id === teacherId) + 1

  return {
    gruppenanzahl: user?.gruppenanzahl || 0,
    teilnehmeranzahl: user?.teilnehmeranzahl || 0,
    groupRank: groupRank || 'N/A',
    participantRank: participantRank || 'N/A',
    totalTeachers: allTeachers.length,
    totalGroups: 0,
    totalParticipants: 0,
    teachers: [],
  }
}

async function getAdminStats() {
    const teachers = await db.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        gruppenanzahl: true,
        teilnehmeranzahl: true,
      }
    })
  
    const totals = teachers.reduce((acc: { totalGroups: any; totalParticipants: any }, teacher: { gruppenanzahl: any; teilnehmeranzahl: any }) => ({
      totalGroups: acc.totalGroups + (teacher.gruppenanzahl || 0),
      totalParticipants: acc.totalParticipants + (teacher.teilnehmeranzahl || 0),
    }), { totalGroups: 0, totalParticipants: 0 })
  
    return {
      teachers,
      ...totals,
      totalTeachers: teachers.length
    }
  }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null
  const isAdmin = session?.user.role == "ADMIN"
  let stats = await getTeacherStats(session.user.id)
  if (isAdmin) {
    //@ts-ignore
    stats = await getAdminStats()
  }
  

  return (
    isAdmin ?
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
        </div> :
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>
      <StatsCards stats={stats} />
    </div>
  )
}