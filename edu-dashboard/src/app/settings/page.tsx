"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { toast } = useToast()
  const { data: session, update } = useSession()
  const router = useRouter()
  
  const [gruppenanzahl, setGruppenanzahl] = useState("")
  const [teilnehmeranzahl, setTeilnehmeranzahl] = useState("")
  
  useEffect(() => {
    if (session?.user) {
      // @ts-ignore
      setGruppenanzahl(session.user.gruppenanzahl?.toString() ?? "")
      // @ts-ignore
      setTeilnehmeranzahl(session.user.teilnehmeranzahl?.toString() ?? "")
    }
  }, [session?.user])
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gruppenanzahl: gruppenanzahl ? parseInt(gruppenanzahl) : null,
          teilnehmeranzahl: teilnehmeranzahl ? parseInt(teilnehmeranzahl) : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update settings")
      
      await update()
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
      
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container max-w-md py-10">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="gruppenanzahl">Gruppenanzahl</Label>
          <Input
            id="gruppenanzahl"
            type="number"
            min={0}
            max={100}
            placeholder="Gib die Anzahl deiner Gruppen an"
            value={gruppenanzahl}
            onChange={(e) => setGruppenanzahl(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="teilnehmeranzahl">Anzahl der Teilnehmer</Label>
          <Input
            id="teilnehmeranzahl"
            type="number"
            min={0}
            max={1000}
            placeholder="Gib die Anzahl deiner Teilnehmer an"
            value={teilnehmeranzahl}
            onChange={(e) => setTeilnehmeranzahl(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            Abbrechen
          </Button>
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </div>
  )
}