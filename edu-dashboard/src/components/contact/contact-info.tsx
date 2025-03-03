import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Mail, Phone, Clock } from "lucide-react"
  
  export function ContactInfo() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kontakt Informationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span>miteinandermatt@schachzwerge-magdeburg.de</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span>0176 84557522</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>Vilen Rafayevych</span>
          </div>
        </CardContent>
      </Card>
    )
  }
  