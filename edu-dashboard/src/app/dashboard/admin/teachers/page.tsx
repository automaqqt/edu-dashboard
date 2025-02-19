import { TeachersTable } from "@/components/admin/teachers/teachers-table"
import { CreateTeacherButton } from "@/components/admin/teachers/create-teacher-button"

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">
            Manage teacher accounts and communications
          </p>
        </div>
        <CreateTeacherButton />
      </div>
      <TeachersTable />
    </div>
  )
}