import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/providers/auth-provider"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

import "./globals.css" // Make sure this is imported

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MitteinanderMatt Dashboard",
  description: "Für die Lehrer und so",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-gray-100 font-sans antialiased",
        inter.className
      )}>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

