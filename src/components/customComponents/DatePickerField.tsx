"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerFieldProps {
  label: string
  name: string
  value?: string
  minDate?: Date       // ⭐ NEW
  onChange: (e: { target: { name: string; value: string } }) => void
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

/** Return local YYYY-MM-DD (not UTC) */
function toLocalISODate(date: Date) {
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  return `${y}-${m}-${d}`
}

export function DatePickerField({
  label,
  name,
  value,
  minDate,
  onChange,
}: DatePickerFieldProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = value ? new Date(value) : undefined

  function formatDate(date: Date | undefined) {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const today = new Date(new Date().setHours(0, 0, 0, 0))
  const minimumDate = minDate || today

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            className={cn(
              "h-11 w-full justify-start text-left font-normal bg-white dark:bg-gray-900 border-2 border-gray-300 rounded-lg"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {value ? formatDate(selectedDate) : "Select date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                // use local YYYY-MM-DD to avoid timezone shift
                const isoLocal = toLocalISODate(date)
                onChange({
                  target: { name, value: isoLocal },
                })
                setOpen(false)
              }
            }}
            // Disable past dates + enforce minDate
            disabled={(date) => date < minimumDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
