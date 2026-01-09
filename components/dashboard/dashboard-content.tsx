"use client"

import { useState, useMemo } from "react"
import type { Task } from "@/types/database"
import { DashboardHeader } from "./dashboard-header"
import { TaskList } from "./task-list"
import { TaskEditModal } from "./task-edit-modal"
import { DashboardFooter } from "./dashboard-footer"
import { useTasks } from "@/hooks/use-tasks"
import { AIChatbot } from "@/components/chat/ai-chatbot"

interface DashboardContentProps {
  initialTasks: Task[]
  userId: string
  userPhone?: string
}

export function DashboardContent({ initialTasks, userId, userPhone }: DashboardContentProps) {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks(initialTasks)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const stats = useMemo(() => {
    const incompleteTasks = tasks.filter((t) => !t.is_completed)
    const totalEstimated = incompleteTasks.reduce((sum, t) => sum + t.pomodoros_estimated, 0)
    const totalActual = tasks.reduce((sum, t) => sum + t.pomodoros_actual, 0)
    const pomodoroMinutes = 25
    const remainingPomodoros = incompleteTasks.reduce((sum, t) => sum + (t.pomodoros_estimated - t.pomodoros_actual), 0)
    const estimatedMinutes = Math.max(0, remainingPomodoros) * pomodoroMinutes
    const finishTime = new Date(Date.now() + estimatedMinutes * 60 * 1000)

    return {
      totalEstimated,
      totalActual,
      finishTime,
      incompleteTasks: incompleteTasks.length,
    }
  }, [tasks])

  const handleCreateTask = async (task: Partial<Task>) => {
    await createTask({ ...task, user_id: userId } as Omit<Task, "id" | "created_at" | "updated_at">)
    setIsCreateModalOpen(false)
  }

  const handleUpdateTask = async (task: Task) => {
    await updateTask(task.id, task)
    setEditingTask(null)
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
    setEditingTask(null)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <DashboardHeader onAddTask={() => setIsCreateModalOpen(true)} userId={userId} userPhone={userPhone} />

      <main className="flex-1 container mx-auto px-4 py-6">
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onEditTask={setEditingTask}
          onToggleComplete={(task) => updateTask(task.id, { is_completed: !task.is_completed })}
          onIncrementPomodoro={(task) =>
            updateTask(task.id, {
              pomodoros_actual: task.pomodoros_actual + 1,
            })
          }
        />
      </main>

      <DashboardFooter
        totalActual={stats.totalActual}
        totalEstimated={stats.totalEstimated}
        finishTime={stats.finishTime}
        incompleteTasks={stats.incompleteTasks}
      />

      <AIChatbot tasks={tasks} selectedTask={editingTask} />

      <TaskEditModal
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
        userId={userId}
      />

      <TaskEditModal
        task={null}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateTask}
        userId={userId}
      />
    </div>
  )
}
