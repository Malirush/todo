"use client"

import { useState, useCallback } from "react"
import type { Task } from "@/types/database"
import { createClient } from "@/lib/supabase/client"

export function useTasks(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)

  const createTask = useCallback(async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
    setIsLoading(true)
    const supabase = createClient()

    // Optimistic update
    const optimisticTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks((prev) => [optimisticTask, ...prev])

    try {
      const { data, error } = await supabase.from("tasks").insert(task).select().single()

      if (error) throw error

      // Replace optimistic task with real one
      setTasks((prev) => prev.map((t) => (t.id === optimisticTask.id ? data : t)))
    } catch (error) {
      // Rollback on error
      setTasks((prev) => prev.filter((t) => t.id !== optimisticTask.id))
      console.error("Failed to create task:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    const supabase = createClient()

    // Store previous state for rollback
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId)
      if (!task) return prev

      // Optimistic update
      return prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    })

    try {
      const { error } = await supabase.from("tasks").update(updates).eq("id", taskId)

      if (error) throw error
    } catch (error) {
      // Refetch on error
      const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })
      if (data) setTasks(data)
      console.error("Failed to update task:", error)
    }
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    const supabase = createClient()

    // Store for rollback
    let deletedTask: Task | undefined
    setTasks((prev) => {
      deletedTask = prev.find((t) => t.id === taskId)
      return prev.filter((t) => t.id !== taskId)
    })

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error
    } catch (error) {
      // Rollback
      if (deletedTask) {
        setTasks((prev) => [deletedTask!, ...prev])
      }
      console.error("Failed to delete task:", error)
    }
  }, [])

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  }
}
