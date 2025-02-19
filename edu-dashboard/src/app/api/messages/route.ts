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

    const body = await req.json()
    const { content } = body

    // Create message
    const message = await db.message.create({
      data: {
        content,
        isFromAdmin: false,
        user: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })

    // Update all admins' notification flags
    await db.user.updateMany({
      where: {
        role: "ADMIN"
      },
      data: {
        hasNewMessage: true,
      }
    })

    await db.user.updateMany({
      where: {
        id: session.user.id
      },
      data: {
        unreadMessageCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get messages based on role
    const messages = await db.message.findMany({
      where: {
        OR: [
          // Messages from any admin
          { userId: session.user.id, isFromAdmin: true },
          // Messages from this specific teacher
          { userId: session.user.id, isFromAdmin: false }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}