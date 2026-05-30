"use client";

import { Badge } from "@/shared/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { X } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";

interface TagsInputProps {
  tags: string[];
  onChange: (i: string[]) => void;
  suggestedTags: string[];
}

export function TagInput({ tags, suggestedTags, onChange }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const canCreate =
    inputValue.trim() &&
    !suggestedTags.includes(inputValue.trim()) &&
    !tags.includes(inputValue.trim());

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) {
      onChange([...tags, t]);
      setInputValue("");
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-text focus-within:ring-2 focus-within:ring-ring">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
              />
            </Badge>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={tags.length === 0 ? "Добавить тег..." : ""}
            className="flex-1 min-w-24 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestedTags.length === 0 && !canCreate && (
              <CommandEmpty>Нет совпадений</CommandEmpty>
            )}
            {suggestedTags.length > 0 && (
              <CommandGroup heading="Существующие">
                {suggestedTags.map((t) => (
                  <CommandItem key={t} onSelect={() => addTag(t)}>
                    {t}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {canCreate && (
              <CommandGroup heading="Создать">
                <CommandItem onSelect={() => addTag(inputValue)}>
                  + «{inputValue}»
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
