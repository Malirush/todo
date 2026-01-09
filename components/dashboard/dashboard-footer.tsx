import { Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface DashboardFooterProps {
  totalActual: number
  totalEstimated: number
  finishTime: Date
  incompleteTasks: number
}

export function DashboardFooter({ totalActual, totalEstimated, finishTime, incompleteTasks }: DashboardFooterProps) {
  return (
    <footer className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Pomos:</span>
            <span className="font-semibold">
              {totalActual} / {totalEstimated}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Tasks:</span>
            <span className="font-semibold">{incompleteTasks} remaining</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Finish at:</span>
          <span className="font-semibold">{format(finishTime, "h:mm a")}</span>
        </div>
      </div>
    </footer>
  )
}
