import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        hasNewMessage: true,
        hasNewAnnouncement: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USER_STATUS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
