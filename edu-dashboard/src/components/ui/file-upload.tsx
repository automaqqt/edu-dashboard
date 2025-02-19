"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  endpoint: string
  value: string
  onChange: (url: string) => void
}

export function FileUpload({ endpoint, value, onChange }: FileUploadProps) {
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/upload")

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100
          setProgress(percentage)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          onChange(response.url)
          setProgress(0)
        } else {
          throw new Error("Upload failed")
        }
      }

      xhr.onerror = () => {
        throw new Error("Upload failed")
      }

      xhr.send(formData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      })
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = ".pdf,.doc,.jpeg,.jpg,.png"
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) handleUpload(file)
            }
            input.click()
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View uploaded file
          </a>
        )}
      </div>
      {progress > 0 && <Progress value={progress} />}
    </div>
  )
}