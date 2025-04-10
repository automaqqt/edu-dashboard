import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, fileUrl, teacherIds } = body

    // Get file size - updated path
    const fileName = fileUrl.split('/').pop()
    const filePath = path.join(process.env.UPLOAD_DIR ? process.env.UPLOAD_DIR : '/var/www/uploads', fileName)
    const stats = fs.statSync(filePath)
    const fileSize = stats.size

    const document = await db.document.createMany({
      data: teacherIds.map((teacherId: number) => {return {
        title,
        fileUrl,
        fileSize,
        type: "SHARED_ADMIN",
        userId: teacherId 
      }})
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error("[ADMIN_DOCUMENTS_SHARED_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}