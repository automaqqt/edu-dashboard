import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const announcements = await db.announcement.findMany({
      where: {
        OR: [
          { isGlobal: true },
          { recipients: {
            some: {
              id: session.user.id, // Filter announcements where the user is in the recipients list
            },
          } }
        ]
      },
      include: {
        user: {
          select: {
            name: true
          }
        },
        recipients: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("[ANNOUNCEMENTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}