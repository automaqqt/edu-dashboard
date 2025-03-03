import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TrainingDocuments } from "@/components/training/training-documents"

export default async function TrainingPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trainingskonzept</h1>
        <p className="text-muted-foreground">
          Zugang zu den Trainingsunterlagen
        </p>
      </div>
      <TrainingDocuments />
    </div>
  )
}