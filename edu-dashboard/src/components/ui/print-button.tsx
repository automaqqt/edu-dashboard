"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Check, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PrintButtonProps {
  fileUrl: string;
  onPrintComplete?: () => void;
  isPrinted?: boolean;
}

export function PrintButton({ fileUrl, onPrintComplete, isPrinted = false }: PrintButtonProps) {
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
            // Trigger the print
            iframeRef.current.contentWindow.print();
            
            // Manually trigger the onPrintComplete callback
            // This works around the unreliable afterprint event
            setTimeout(() => {
              if (onPrintComplete) {
                onPrintComplete();
              }
              setIsPrinting(false);
              
              // Show toast notification of successful print
              toast({
                title: "Success",
                description: "Document sent to printer",
              });
            }, 1000); // Short delay to ensure print dialog has opened
          }
        } catch (error) {
          console.error('Print failed:', error)
          toast({
            title: "Error",
            description: "Failed to print document",
            variant: "destructive",
          })
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
        disabled={isPrinting || isPrinted}
        className={isPrinted ? "opacity-50 cursor-not-allowed" : ""}
      >
        {isPrinted ? (
          <>
            <Printer className="h-4 w-4" />
          </>
        ) : (
          <Printer className={`h-4 w-4 ${isPrinting ? 'animate-pulse' : ''}`} />
        )}
        <span className="sr-only">{isPrinted ? "Already printed" : "Print document"}</span>
      </Button>
      <iframe
        ref={iframeRef}
        style={{ display: 'none' }}
        title="Print Frame"
      />
    </>
  )
}