import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        hasNewAnnouncement: false
      }
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[ANNOUNCEMENTS_READ]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}