import type React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, MessageSquare, Smartphone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border/50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Pomodoro Tasks</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
            Manage Tasks with
            <span className="text-primary"> Pomodoro Power</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            A production-ready task management app with Pomodoro tracking, AI assistance, and WhatsApp integration. Stay
            focused and get more done.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Task Management"
              description="Create, edit, and organize tasks with descriptions and notes."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="Pomodoro Tracking"
              description="Track estimated and actual pomodoros for each task."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="AI Assistant"
              description="Get AI-powered suggestions to improve your tasks."
            />
            <FeatureCard
              icon={<Smartphone className="h-6 w-6" />}
              title="WhatsApp Integration"
              description="Manage tasks directly from WhatsApp messages."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
