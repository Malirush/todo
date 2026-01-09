"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Task, Note } from "@/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Minus, Plus, StickyNote, FolderPlus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TaskEditModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task | Partial<Task>) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  userId: string
}

export function TaskEditModal({ task, open, onOpenChange, onSave, onDelete, userId }: TaskEditModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pomodorosEstimated, setPomodorosEstimated] = useState(1)
  const [pomodorosActual, setPomodorosActual] = useState(0)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [newNote, setNewNote] = useState("")

  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setPomodorosEstimated(task.pomodoros_estimated)
      setPomodorosActual(task.pomodoros_actual)
      loadNotes(task.id)
    } else {
      setTitle("")
      setDescription("")
      setPomodorosEstimated(1)
      setPomodorosActual(0)
      setNotes([])
    }
  }, [task])

  const loadNotes = async (taskId: string) => {
    setIsLoadingNotes(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
    setNotes(data || [])
    setIsLoadingNotes(false)
  }

  const handleAddNote = async () => {
    if (!task || !newNote.trim()) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("notes")
      .insert({ task_id: task.id, content: newNote.trim() })
      .select()
      .single()
    if (!error && data) {
      setNotes([data, ...notes])
      setNewNote("")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    const supabase = createClient()
    await supabase.from("notes").delete().eq("id", noteId)
    setNotes(notes.filter((n) => n.id !== noteId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsLoading(true)
    try {
      if (isEditing && task) {
        await onSave({
          ...task,
          title: title.trim(),
          description: description.trim() || null,
          pomodoros_estimated: pomodorosEstimated,
          pomodoros_actual: pomodorosActual,
        })
      } else {
        await onSave({
          title: title.trim(),
          description: description.trim() || null,
          pomodoros_estimated: pomodorosEstimated,
          pomodoros_actual: 0,
          is_completed: false,
          user_id: userId,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !onDelete) return
    setIsLoading(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update your task details below" : "Add a new task to your list"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, steps, or notes..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estimated Pomodoros</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPomodorosEstimated(Math.max(1, pomodorosEstimated - 1))}
                  disabled={pomodorosEstimated <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{pomodorosEstimated}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setPomodorosEstimated(pomodorosEstimated + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label>Actual Pomodoros</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPomodorosActual(Math.max(0, pomodorosActual - 1))}
                    disabled={pomodorosActual <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{pomodorosActual}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPomodorosActual(pomodorosActual + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Notes</Label>
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddNote()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <StickyNote className="h-4 w-4" />
                </Button>
              </div>
              {isLoadingNotes ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : notes.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-start gap-2 text-sm bg-muted p-2 rounded-md">
                      <p className="flex-1">{note.content}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" disabled className="gap-2 bg-transparent">
              <FolderPlus className="h-4 w-4" />
              Add Project
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEditing && onDelete && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !title.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "Save" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
