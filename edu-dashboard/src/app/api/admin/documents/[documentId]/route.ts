import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import fs from "fs/promises"
import path from "path"

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }

    // Get the document to find the file path
    const document = await db.document.findUnique({
      where: {
        id: params.documentId
      }
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    // Delete the file from storage
    try {
      const filePath = path.join(process.env.UPLOAD_DIR ? process.env.UPLOAD_DIR : '/var/www/uploads', document.fileUrl)
      await fs.unlink(filePath)
    } catch (error) {
      console.error("Error deleting file:", error)
      // Continue with database deletion even if file deletion fails
    }

    // Delete the document from the database
    await db.document.delete({
      where: {
        userId: session.user.id,
        id: params.documentId
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TRAINING_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
