"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 w-full", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "w-full",
        month_caption: "flex justify-center items-start mb-4 relative h-7",
        caption_label: "text-sm font-medium h-7 flex items-start absolute left-1/2 -translate-x-1/2 -top-2",
        nav: "flex items-center gap-1 h-7 absolute inset-0 w-full",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "absolute left-0 top-0 h-7 w-7"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "absolute right-0 top-0 h-7 w-7"
        ),
        month_grid: "w-full",
        weekdays: "flex w-full",
        weekday: "flex-1 text-muted-foreground text-xs font-normal text-center p-0 pb-2",
        week: "flex w-full mt-1",
        day: "flex-1 p-0 text-center text-sm relative",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 mx-auto p-0 font-normal hover:bg-green-50 hover:text-green-900 dark:hover:bg-green-950 dark:hover:text-green-100"
        ),
        selected: "bg-green-600 text-white hover:bg-green-700 hover:text-white dark:bg-green-600 dark:hover:bg-green-700",
        today: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/30 line-through",
        range_start: "rounded-l-md bg-green-600 text-white",
        range_end: "rounded-r-md bg-green-600 text-white",
        range_middle: "bg-green-100 text-green-900 rounded-none dark:bg-green-950 dark:text-green-100",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" {...props} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
