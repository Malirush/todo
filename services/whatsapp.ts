// WhatsApp Evolution API Service
// This service handles communication with the Evolution API for WhatsApp integration

export interface WhatsAppConfig {
  apiUrl: string
  apiKey: string
  instanceName: string
}

export interface WhatsAppMessage {
  from: string
  body: string
  timestamp: number
}

export class WhatsAppService {
  private config: WhatsAppConfig

  constructor(config: WhatsAppConfig) {
    this.config = config
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      apikey: this.config.apiKey,
    }
  }

  private get baseUrl() {
    return `${this.config.apiUrl}/message/sendText/${this.config.instanceName}`
  }

  async sendMessage(to: string, text: string): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          number: to,
          text,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("WhatsApp send error:", error)
      return false
    }
  }

  async sendTaskSummary(
    to: string,
    tasks: Array<{ title: string; pomodoros_estimated: number; pomodoros_actual: number; is_completed: boolean }>,
  ): Promise<boolean> {
    const incompleteTasks = tasks.filter((t) => !t.is_completed)
    const completedTasks = tasks.filter((t) => t.is_completed)

    let message = "*📋 Daily Task Summary*\n\n"

    if (incompleteTasks.length > 0) {
      message += "*Active Tasks:*\n"
      incompleteTasks.forEach((task, i) => {
        message += `${i + 1}. ${task.title} (${task.pomodoros_actual}/${task.pomodoros_estimated} 🍅)\n`
      })
    }

    if (completedTasks.length > 0) {
      message += "\n*Completed Today:*\n"
      completedTasks.forEach((task) => {
        message += `✅ ${task.title}\n`
      })
    }

    const totalPomodoros = tasks.reduce((sum, t) => sum + t.pomodoros_actual, 0)
    message += `\n*Total Pomodoros:* ${totalPomodoros} 🍅`

    return this.sendMessage(to, message)
  }

  async sendTaskList(to: string, tasks: Array<{ id: string; title: string; is_completed: boolean }>): Promise<boolean> {
    const incompleteTasks = tasks.filter((t) => !t.is_completed)

    if (incompleteTasks.length === 0) {
      return this.sendMessage(to, "✨ No active tasks! Create a new task in the app.")
    }

    let message = "*📋 Your Active Tasks:*\n\n"
    incompleteTasks.forEach((task, i) => {
      message += `${i + 1}. ${task.title}\n`
    })
    message += `\n_Reply with a task number to mark it complete_`

    return this.sendMessage(to, message)
  }
}

export function createWhatsAppService(): WhatsAppService | null {
  const apiUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME

  if (!apiUrl || !apiKey || !instanceName) {
    return null
  }

  return new WhatsAppService({ apiUrl, apiKey, instanceName })
}
