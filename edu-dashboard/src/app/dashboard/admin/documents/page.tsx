import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TeacherDocumentsTable } from "@/components/admin/documents/teacher-documents-table"
import { UploadAdminDocumentButton } from "@/components/admin/documents/upload-admin-document-button"

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== "ADMIN") return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground">
          Manage private documents and shared admin documents
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Documents</h2>
          <UploadAdminDocumentButton />
        </div>
        <TeacherDocumentsTable />
      </div>
    </div>
  )
}