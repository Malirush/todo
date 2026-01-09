"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface WhatsAppSettingsProps {
  userId: string
  currentPhone?: string
}

export function WhatsAppSettings({ userId, currentPhone }: WhatsAppSettingsProps) {
  const [phone, setPhone] = useState(currentPhone || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const loadPhone = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("profiles").select("phone").eq("user_id", userId).single()

      if (data?.phone) {
        setPhone(data.phone)
      }
    }
    loadPhone()
  }, [userId])

  const handleSave = async () => {
    if (!phone.trim()) return

    setIsLoading(true)
    const supabase = createClient()
    const cleanPhone = phone.replace(/\D/g, "")

    try {
      const { data: existing } = await supabase.from("profiles").select("id").eq("user_id", userId).single()

      if (existing) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({ phone: cleanPhone, updated_at: new Date().toISOString() })
          .eq("user_id", userId)

        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase.from("profiles").insert({
          user_id: userId,
          phone: cleanPhone,
        })

        if (error) throw error
      }

      console.log("[v0] Phone saved to profiles:", cleanPhone)

      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        setOpen(false)
      }, 1500)
    } catch (error) {
      console.error("Failed to save phone:", error)
      alert("Erro ao salvar telefone. Verifique se a tabela profiles existe.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Smartphone className="h-4 w-4" />
          WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Integração WhatsApp</DialogTitle>
          <DialogDescription>
            Vincule seu número do WhatsApp para receber resumos e gerenciar tarefas por mensagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="5511999998888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Apenas números com código do país (ex: 5511999998888)</p>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
            <p className="font-medium">Comandos Disponíveis:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <code className="bg-background px-1 rounded">#todolist</code> - Lista tarefas ativas
              </li>
              <li>
                <code className="bg-background px-1 rounded">#summary</code> - Resumo diário
              </li>
              <li>
                <code className="bg-background px-1 rounded">[número]</code> - Completa uma tarefa
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading || !phone.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvo
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
