import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Debug endpoint to check WhatsApp configuration
export async function GET() {
  const supabase = await createClient()

  // Get all profiles with phone numbers
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("user_id, phone, created_at")

  return NextResponse.json({
    status: "debug",
    environment: {
      has_evolution_url: !!process.env.EVOLUTION_API_URL,
      has_evolution_key: !!process.env.EVOLUTION_API_KEY,
      has_instance_name: !!process.env.EVOLUTION_INSTANCE_NAME,
      evolution_url: process.env.EVOLUTION_API_URL ? "configured" : "missing",
      instance_name: process.env.EVOLUTION_INSTANCE_NAME || "missing",
    },
    profiles: profiles || [],
    profiles_error: profilesError?.message || null,
    webhook_url: "/api/whatsapp/webhook",
    instructions: {
      step1: "Execute o script SQL: scripts/002-add-profiles-table.sql",
      step2: "Configure as variáveis: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME",
      step3: "No painel Evolution API, configure o webhook para: https://seu-dominio.vercel.app/api/whatsapp/webhook",
      step4: "Adicione seu telefone nas configurações do app (apenas números: 5511999998888)",
    },
  })
}
