import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Resend } from "resend"
import crypto from "crypto"
import { checkRateLimit } from "@/lib/rate-limit"
import { ResetPasswordEmail } from "@/components/emails/reset-password-email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    
    // Check rate limit
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return new NextResponse(
        "Too many password reset attempts. Please try again later.", 
        { status: 429 }
      )
    }

    const { email } = await req.json()

    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({ success: true })
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000*24*7) // 1 hour from now

    // Save token hash to database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex")

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry
      }
    })

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`

    // Send email
    await resend.emails.send({
      from: "EduDashboard <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password",
      react: ResetPasswordEmail({ resetUrl }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESET_PASSWORD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}