// components/custom/SearchableSelect.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options?: Option[];                    // Optional: pass pre-loaded data
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => Promise<void> | void; // Parent handles search
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options = [],
  value,
  onChange,
  onSearch,
  loading = false,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  includeAllOption = true,
  allOptionLabel = "All",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Final list of options
  const finalOptions = useMemo(() => {
    const list = includeAllOption
      ? [{ value: "all", label: allOptionLabel }, ...options]
      : options;

    // Client-side filter if no onSearch
    if (!onSearch && search) {
      return list.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [options, search, includeAllOption, allOptionLabel, onSearch]);

  // Debounced search call to parent
  useEffect(() => {
    if (onSearch && open) {
      const timer = setTimeout(() => {
        onSearch(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, open, onSearch]);

  // Reset search when closed
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setSearch("");
  };

  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return allOptionLabel;
    const found = options.find((opt) => opt.value === value);
    return found?.label || placeholder;
  }, [value, options, allOptionLabel, placeholder]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11 font-normal", className)}
        >
          <span className="truncate">{selectedLabel}</span>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                Loading...
              </CommandEmpty>
            ) : finalOptions.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {finalOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;