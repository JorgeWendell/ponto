"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  selected?: Date | null
  startDate?: Date | null
  endDate?: Date | null
  onSelect?: (date: Date) => void
  className?: string
}

export function Calendar({
  selected,
  startDate,
  endDate,
  onSelect,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = getDay(monthStart)
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (firstDayOfWeek - i))
    return date
  })

  const lastDayOfWeek = getDay(monthEnd)
  const daysAfterMonth = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + i + 1)
    return date
  })

  const allDays = [...daysBeforeMonth, ...daysInMonth, ...daysAfterMonth]

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false
    return date >= startDate && date <= endDate
  }

  const isStartDate = (date: Date) => {
    if (!startDate) return false
    return isSameDay(date, startDate)
  }

  const isEndDate = (date: Date) => {
    if (!endDate) return false
    return isSameDay(date, endDate)
  }

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(date)
    }
    onSelect?.(date)
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const weekDays = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]

  return (
    <div className={cn("p-2", className)}>
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousMonth}
          className="h-6 w-6"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <h3 className="font-semibold text-xs">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-6 w-6"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1.5">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {allDays.map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const inRange = isInRange(date)
          const isStart = isStartDate(date)
          const isEnd = isEndDate(date)

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              className={cn(
                "h-7 w-7 text-xs rounded-md transition-colors",
                !isCurrentMonth && "text-muted-foreground/40",
                inRange && !isStart && !isEnd && "bg-accent",
                isStart && "bg-foreground text-background font-semibold",
                isEnd && "bg-foreground text-background font-semibold",
                !inRange && !isStart && !isEnd && "hover:bg-accent"
              )}
            >
              {format(date, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

