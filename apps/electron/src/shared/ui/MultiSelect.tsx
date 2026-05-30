import { useUiActions } from "@/store/uiStore";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "../../shared/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../shared/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../shared/ui/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No options found",
}: MultiSelectProps) {
  const { setMode } = useUiActions();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleOpenChange(next: boolean) {
    setMode(next ? "normal" : "edit");
  }

  useEffect(() => {
    return () => setMode("normal");
  }, [setMode]);

  const label = selected.length ? `${selected.length} selected` : placeholder;

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="justify-between font-normal text-muted-foreground"
          onFocus={() => setMode("edit")}
          onBlur={() => setMode("normal")}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setMode("normal");
              triggerRef.current?.blur();
            }
          }}
        >
          {label}
          <ChevronDownIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-0"
        align="start"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          setMode("normal");
          triggerRef.current?.blur();
        }}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      const next = isSelected
                        ? selected.filter((v) => v !== opt.value)
                        : [...selected, opt.value];
                      onChange(next);
                    }}
                  >
                    <CheckIcon
                      className={isSelected ? "opacity-100" : "opacity-0"}
                    />
                    {opt.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
