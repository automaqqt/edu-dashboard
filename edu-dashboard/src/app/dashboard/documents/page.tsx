import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DocumentsList } from "@/components/documents/documents-list"
import { UploadDocumentButton } from "@/components/documents/upload-document-button"

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumente</h1>
          <p className="text-muted-foreground">
            Verwalte deine Dokumente
          </p>
        </div>
        <UploadDocumentButton />
      </div>
      <DocumentsList />
    </div>
  )
}