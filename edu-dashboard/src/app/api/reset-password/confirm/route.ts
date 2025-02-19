import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // Hash the provided token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    // Find user with valid token
    const user = await db.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return new NextResponse("Invalid or expired reset token", { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESET_PASSWORD_CONFIRM]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}