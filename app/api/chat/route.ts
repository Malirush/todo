import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, context } = await request.json()

    // Check if n8n webhook URL is configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl) {
      // Send to n8n webhook for AI processing
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          context,
          user_id: user.id,
        }),
      })

      if (n8nResponse.ok) {
        const data = await n8nResponse.json()
        return NextResponse.json({ response: data.response || data.message || data })
      }
    }

    // Fallback: Use Vercel AI Gateway
    const { generateText } = await import("ai")

    const systemPrompt = `You are a helpful task management assistant. You help users:
- Improve task descriptions to be clearer and more actionable
- Break down complex tasks into smaller, manageable steps
- Suggest optimizations for better productivity
- Provide Pomodoro technique tips

Current context:
${JSON.stringify(context, null, 2)}

Be concise but helpful. Use markdown formatting when appropriate.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: message,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
