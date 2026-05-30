import { DATE_FORMAT } from "@/app/config.ts"
import { useUiActions } from "@/store/uiStore"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import { useState } from "react"
import type { ControllerRenderProps } from "react-hook-form"
import { Button } from "../../shared/ui/button.tsx"
import { Calendar } from "../../shared/ui/calendar.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "../../shared/ui/popover.tsx"

interface DatePickerFieldProps {
  field: Pick<ControllerRenderProps, "value" | "onChange">
  placeholder?: string
}

export function DatePickerField({ field, placeholder = "Date" }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const { setMode } = useUiActions()

  const parsed = field.value ? parse(field.value, DATE_FORMAT, new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  function handleOpenChange(next: boolean) {
    setOpen(next)
    setMode(next ? "normal" : "edit")
  }

  function handleSelect(date: Date | undefined) {
    field.onChange(date ? format(date, DATE_FORMAT) : "")
    setOpen(false)
    setMode("normal")
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    field.onChange("")
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 font-normal text-muted-foreground">
          <CalendarIcon className="size-4" />
          {selected ? format(selected, DATE_FORMAT) : placeholder}
          {selected && <XIcon className="ml-auto size-3" onClick={handleClear} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}
