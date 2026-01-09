import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createWhatsAppService } from "@/services/whatsapp"

// API endpoint to manually trigger a task summary via WhatsApp
// Can be called by a cron job for daily summaries
export async function POST(request: Request) {
  try {
    const { user_id, phone } = await request.json()

    if (!user_id || !phone) {
      return NextResponse.json({ error: "user_id and phone are required" }, { status: 400 })
    }

    const whatsapp = createWhatsAppService()
    if (!whatsapp) {
      return NextResponse.json({ error: "WhatsApp service not configured" }, { status: 500 })
    }

    const supabase = await createClient()

    // Verify the user owns this request (via auth or API key)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, pomodoros_estimated, pomodoros_actual, is_completed")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20)

    const success = await whatsapp.sendTaskSummary(phone, tasks || [])

    if (success) {
      return NextResponse.json({ status: "sent" })
    } else {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
