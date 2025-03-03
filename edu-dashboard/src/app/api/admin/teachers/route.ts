import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import crypto from "crypto"

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

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000*24*7) // 1 hour from now

    // Save token hash to database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`

    const teacher = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "TEACHER"
      }
    })

    await db.user.update({
      where: { id: teacher.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry
      }
    })

    return NextResponse.json(resetUrl)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
