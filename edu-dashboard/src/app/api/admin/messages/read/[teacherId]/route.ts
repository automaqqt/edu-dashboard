import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Mark messages from this teacher as read
    await db.message.updateMany({
      where: {
        userId: params.teacherId,
        isRead: false,
        isFromAdmin: false
      },
      data: {
        isRead: true
      }
    })

    // Reset the admin's unread message count
    await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        hasNewMessage: false
      }
    })

    await db.user.update({
        where: {
          id: params.teacherId
        },
        data: {
          unreadMessageCount: 0 // Reset completely since we're marking all as read
        }
      })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[ADMIN_MESSAGES_READ]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}