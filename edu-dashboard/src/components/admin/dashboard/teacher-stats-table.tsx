"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

interface Teacher {
    id: string
    name: string | null
    email: string
    gruppenanzahl: number | null
    teilnehmeranzahl: number | null
    lastLoginAt: Date | null
  }

interface TeacherStatsTableProps {
  teachers: Teacher[]
}

type SortField = 'gruppenanzahl' | 'teilnehmeranzahl'
type SortDirection = 'asc' | 'desc'

export function TeacherStatsTable({ teachers }: TeacherStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>('gruppenanzahl')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedTeachers = [...teachers].sort((a, b) => {
    const aValue = a[sortField] || 0
    const bValue = b[sortField] || 0
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort('gruppenanzahl')}
              className="font-medium"
            >
              Groups
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => toggleSort('teilnehmeranzahl')}
              className="font-medium"
            >
              Participants
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Letzte Anmeldung</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTeachers.map((teacher) => (
          <TableRow key={teacher.id}>
            <TableCell>{teacher.name || 'N/A'}</TableCell>
            <TableCell>{teacher.email}</TableCell>
            <TableCell>{teacher.gruppenanzahl || 0}</TableCell>
            <TableCell>{teacher.teilnehmeranzahl || 0}</TableCell>
            <TableCell>{teacher.lastLoginAt ? teacher.lastLoginAt.toLocaleDateString() : "Kein Datum verfügbar"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}