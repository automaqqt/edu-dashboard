import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const teachers = await db.user.findMany({
      where: {
        role: "TEACHER"
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        lastLoginAt: true,
        isActive: true,
        unreadMessageCount: true,
        gruppenanzahl: true,
        teilnehmeranzahl: true,
        notes: true,
        hasNewMessage: true,
        hasNewAnnouncement: true
      },
      orderBy: [
        { hasNewMessage: 'desc' },
        { unreadMessageCount: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(teachers)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { email, name, password } = body

    const hashedPassword = await hash(password, 12)

    const teacher = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "TEACHER"
      }
    })

    return NextResponse.json(teacher)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
