import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: tasks } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

  // Get user's phone number from metadata
  const userPhone = user.user_metadata?.phone

  return <DashboardContent initialTasks={tasks || []} userId={user.id} userPhone={userPhone} />
}
