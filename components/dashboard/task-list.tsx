"use client"

import type { Task } from "@/types/database"
import { TaskCard } from "./task-card"
import { Loader2 } from "lucide-react"

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  onEditTask: (task: Task) => void
  onToggleComplete: (task: Task) => void
  onIncrementPomodoro: (task: Task) => void
}

export function TaskList({ tasks, isLoading, onEditTask, onToggleComplete, onIncrementPomodoro }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No tasks yet</h3>
        <p className="text-muted-foreground mt-1">{"Create your first task to get started"}</p>
      </div>
    )
  }

  const incompleteTasks = tasks.filter((t) => !t.is_completed)
  const completedTasks = tasks.filter((t) => t.is_completed)

  return (
    <div className="space-y-6">
      {incompleteTasks.length > 0 && (
        <div className="space-y-3">
          {incompleteTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onToggleComplete={() => onToggleComplete(task)}
              onIncrementPomodoro={() => onIncrementPomodoro(task)}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
          {completedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onToggleComplete={() => onToggleComplete(task)}
              onIncrementPomodoro={() => onIncrementPomodoro(task)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
