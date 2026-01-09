"use client"

import { Button } from "@/components/ui/button"
import { Clock, LogOut, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { WhatsAppSettings } from "./whatsapp-settings"

interface DashboardHeaderProps {
  onAddTask: () => void
  userId?: string
  userPhone?: string
}

export function DashboardHeader({ onAddTask, userId, userPhone }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Pomodoro Tasks</span>
        </div>
        <div className="flex items-center gap-3">
          {userId && <WhatsAppSettings userId={userId} currentPhone={userPhone} />}
          <Button onClick={onAddTask} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
