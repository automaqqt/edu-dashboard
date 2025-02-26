import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import fs from "fs"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, fileUrl, teacherIds } = body

    // Get file size
    const filePath = `public${fileUrl}`
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