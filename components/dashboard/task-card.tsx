"use client"

import type { Task } from "@/types/database"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onToggleComplete: () => void
  onIncrementPomodoro: () => void
}

export function TaskCard({ task, onEdit, onToggleComplete, onIncrementPomodoro }: TaskCardProps) {
  return (
    <Card
      className={cn(
        "group flex items-center gap-4 p-4 transition-all hover:shadow-md cursor-pointer",
        task.is_completed && "opacity-60",
      )}
      onClick={onEdit}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onToggleComplete()
        }}
      >
        <Checkbox checked={task.is_completed} className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn("font-medium truncate", task.is_completed && "line-through text-muted-foreground")}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">{task.description.split("\n")[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {task.pomodoros_actual}/{task.pomodoros_estimated}
          </span>
        </div>

        {!task.is_completed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              onIncrementPomodoro()
            }}
            title="Complete a pomodoro"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
