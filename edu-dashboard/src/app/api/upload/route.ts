import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import fs from "fs"
import path from "path"
import crypto from "crypto"

// Valid MIME types and their file extensions
const VALID_MIME_TYPES = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg'
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 })
    }

    // Check file type
    if (!VALID_MIME_TYPES[file.type as keyof typeof VALID_MIME_TYPES]) {
      return new NextResponse(
        "Invalid file type. Only PDF, PNG, and JPEG files are allowed.",
        { status: 400 }
      )
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return new NextResponse(
        "File too large. Maximum size is 10MB.",
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = VALID_MIME_TYPES[file.type as keyof typeof VALID_MIME_TYPES]
    const randomName = crypto.randomBytes(16).toString('hex')
    const fileName = randomName + fileExtension

    // New upload directory
    const uploadDir = '/var/www/uploads'
    
    // Save file
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      await fs.promises.writeFile(filePath, buffer)
    } catch (error) {
      console.error("Failed to write file:", error)
      return new NextResponse("Failed to save file", { status: 500 })
    }

    const url = `/uploads/${fileName}`

    return NextResponse.json({ 
      url,
      size: file.size,
      name: file.name,
      type: file.type
    })

  } catch (error) {
    console.error("[UPLOAD_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}