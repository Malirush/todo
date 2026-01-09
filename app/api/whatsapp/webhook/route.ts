import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createWhatsAppService } from "@/services/whatsapp"

// Store recent webhooks for debugging (in-memory, resets on deploy)
const recentWebhooks: Array<{ timestamp: string; body: unknown }> = []

// Webhook handler for incoming WhatsApp messages via Evolution API
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] WhatsApp Webhook received:", JSON.stringify(body, null, 2))

    // Store for debugging
    recentWebhooks.unshift({ timestamp: new Date().toISOString(), body })
    if (recentWebhooks.length > 20) recentWebhooks.pop()

    // Evolution API webhook payload structure
    const message = body.data?.message
    const from = message?.key?.remoteJid?.replace("@s.whatsapp.net", "")
    const text = message?.conversation || message?.extendedTextMessage?.text

    console.log("[v0] Parsed message - from:", from, "text:", text)

    if (!from || !text) {
      console.log("[v0] Ignored - missing from or text")
      return NextResponse.json({ status: "ignored", reason: "missing_data" })
    }

    const whatsapp = createWhatsAppService()
    if (!whatsapp) {
      console.error(
        "[v0] WhatsApp service not configured - check EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME",
      )
      return NextResponse.json({ error: "WhatsApp not configured" }, { status: 500 })
    }

    const supabase = await createClient()

    // Look up user by phone number in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", from)
      .single()

    console.log("[v0] Profile lookup - phone:", from, "profile:", profile, "error:", profileError)

    if (!profile) {
      console.log("[v0] User not found for phone:", from)
      await whatsapp.sendMessage(
        from,
        "❌ Seu número não está vinculado a uma conta. Por favor, adicione seu número nas configurações do app.",
      )
      return NextResponse.json({ status: "user_not_found", phone: from })
    }

    const userId = profile.user_id

    // Handle commands
    const command = text.trim().toLowerCase()
    console.log("[v0] Processing command:", command, "for user:", userId)

    if (command === "#todolist" || command === "#tasks") {
      // List active tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, is_completed")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })

      console.log("[v0] Tasks query result:", tasks, "error:", tasksError)

      await whatsapp.sendTaskList(from, tasks || [])
      return NextResponse.json({ status: "tasks_sent" })
    }

    if (command === "#summary") {
      // Send daily summary
      const { data: tasks } = await supabase
        .from("tasks")
        .select("title, pomodoros_estimated, pomodoros_actual, is_completed")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      await whatsapp.sendTaskSummary(from, tasks || [])
      return NextResponse.json({ status: "summary_sent" })
    }

    // Check if it's a number (to complete a task)
    const taskNumber = Number.parseInt(command)
    if (!isNaN(taskNumber) && taskNumber > 0) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("user_id", userId)
        .eq("is_completed", false)
        .order("created_at", { ascending: false })

      if (tasks && tasks[taskNumber - 1]) {
        const task = tasks[taskNumber - 1]
        await supabase.from("tasks").update({ is_completed: true }).eq("id", task.id)

        await whatsapp.sendMessage(from, `✅ Concluída: ${task.title}`)
        return NextResponse.json({ status: "task_completed" })
      }
    }

    await whatsapp.sendMessage(
      from,
      `*Comandos Disponíveis:*\n\n` +
        `#todolist - Lista suas tarefas ativas\n` +
        `#summary - Resumo diário\n` +
        `[número] - Marca tarefa como concluída\n\n` +
        `Exemplo: Responda "1" para completar a primeira tarefa`,
    )

    return NextResponse.json({ status: "help_sent" })
  } catch (error) {
    console.error("[v0] WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "WhatsApp webhook endpoint",
    recent_webhooks: recentWebhooks,
    env_check: {
      has_evolution_url: !!process.env.EVOLUTION_API_URL,
      has_evolution_key: !!process.env.EVOLUTION_API_KEY,
      has_instance_name: !!process.env.EVOLUTION_INSTANCE_NAME,
    },
  })
}
