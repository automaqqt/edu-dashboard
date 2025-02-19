import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthenticated = !!token
  const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin")
  const isUploadFile = req.nextUrl.pathname.startsWith("/uploads/")
  
  // Allow access to uploaded files if authenticated
  if (isUploadFile && isAuthenticated) {
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/uploads/:path*"]
}