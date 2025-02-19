"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PrintButtonProps {
  fileUrl: string
}

export function PrintButton({ fileUrl }: PrintButtonProps) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handlePrint = async () => {
    try {
      setIsPrinting(true)

      // Create or get the iframe
      if (!iframeRef.current) {
        toast({
          title: "Error",
          description: "Print functionality not available",
          variant: "destructive",
        })
        return
      }

      // Set the iframe source to the file URL
      iframeRef.current.src = fileUrl

      // Wait for the iframe to load
      iframeRef.current.onload = () => {
        try {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.print()
          }
        } catch (error) {
          console.error('Print failed:', error)
          toast({
            title: "Error",
            description: "Failed to print document",
            variant: "destructive",
          })
        } finally {
          setIsPrinting(false)
        }
      }

    } catch (error) {
      console.error('Print error:', error)
      toast({
        title: "Error",
        description: "Failed to print document",
        variant: "destructive",
      })
      setIsPrinting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrint}
        disabled={isPrinting}
      >
        <Printer className={`h-4 w-4 ${isPrinting ? 'animate-pulse' : ''}`} />
        <span className="sr-only">Print document</span>
      </Button>
      <iframe
        ref={iframeRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </>
  )
}