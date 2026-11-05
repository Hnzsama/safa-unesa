"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari opsi...",
  emptyText = "Tidak ada hasil ditemukan.",
  disabled = false,
  className,
  icon,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(q) : false;
      const matchBadge = opt.badge ? opt.badge.toLowerCase().includes(q) : false;
      return matchLabel || matchDesc || matchBadge;
    });
  }, [options, searchQuery]);

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchQuery("");
    }
  };

  // When opening, auto focus search input
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "flex h-11 sm:h-10 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-base sm:text-sm transition-colors hover:bg-muted/40 focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
      </PopoverTrigger>

      <PopoverContent className="p-0 overflow-hidden bg-card border-border shadow-xl">
        {/* Search Input Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/30">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Scrollable Option List */}
        <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
          {filteredOptions.length === 0 ? (
            <div className="py-6 px-3 text-center text-xs text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onValueChange(opt.value);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {opt.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase",
                            isSelected
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {opt.description && (
                      <span
                        className={cn(
                          "text-[10px] block mt-0.5 truncate",
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {opt.description}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="size-3.5 shrink-0 ml-1.5" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
