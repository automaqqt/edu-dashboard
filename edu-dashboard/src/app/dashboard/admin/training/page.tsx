import { AddFolderButton } from "@/components/admin/training/add-folder-button"
import { TrainingDocumentsAdmin } from "@/components/admin/training/training-documents-admin"
import { UploadTrainingButton } from "@/components/admin/training/upload-training-button"

export default function TrainingManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Documents</h1>
          <p className="text-muted-foreground">
            Manage training materials for teachers
          </p>
        </div>
        
      </div>
      <TrainingDocumentsAdmin />
    </div>
  )
}