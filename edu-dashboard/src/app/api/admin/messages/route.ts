import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { content, teacherId } = body

    if (!teacherId) {
      return new NextResponse("Teacher ID is required", { status: 400 })
    }

    const message = await db.message.create({
      data: {
        content,
        isFromAdmin: true,
        user: {
          connect: {
            id: teacherId
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

    // Update teacher's unread count
    await db.user.update({
      where: {
        id: teacherId
      },
      data: {
        hasNewMessage:true,
        unreadMessageCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[ADMIN_MESSAGES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId")

    if (!teacherId) {
      return new NextResponse("Teacher ID is required", { status: 400 })
    }

    // Get conversation between admin and specific teacher
    // Based on our simplified Message schema with isFromAdmin flag
    const messages = await db.message.findMany({
      where: {
        OR: [
          {
            // Admin-sent messages
            isFromAdmin: true,
            userId: teacherId,
          },
          {
            // Messages from this specific teacher
            isFromAdmin: false,
            userId: teacherId
          }
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
    console.error("[ADMIN_MESSAGES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}