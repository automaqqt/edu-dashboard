"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, UserPlus, FileText, Bell } from "lucide-react"

interface StatsCardsProps {
  stats: {
    gruppenanzahl: number
    teilnehmeranzahl: number
    groupRank: number | string
    participantRank: number | string
    totalTeachers: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.gruppenanzahl}</div>
          <p className="text-xs text-muted-foreground">
            Rank {stats.groupRank} 
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.teilnehmeranzahl}</div>
          <p className="text-xs text-muted-foreground">
            Rank {stats.participantRank}
          </p>
        </CardContent>
      </Card>
      {/* Add other cards as needed */}
    </div>
  )
}