// components/custom/SearchableSalesmanSelect.tsx
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
import { useUserManagementStore } from "../../../store/userManagementStore";
import { useCompanyStore } from "../../../store/companyStore";

interface SearchableSalesmanSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSalesmanSelect: React.FC<SearchableSalesmanSelectProps> = ({
  value,
  onChange,
  placeholder = "Select salesman...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { users, loading, filterUsers } = useUserManagementStore();
  const { defaultSelected } = useCompanyStore();
  const companyId = defaultSelected?._id;

  // Build options from current users in store
  const options = useMemo(() => {
    const userOptions = users.map((u: any) => ({
      value: u._id,
      label: u.name,
    }));

    return [
      { value: "all", label: "All Salesmen" },
      ...userOptions,
    ];
  }, [users]);

  // Load users on open or search
  const loadUsers = useCallback(async () => {
    if (!companyId) return;

    try {
      await filterUsers(
        search,
        "all",
        "all",
        "nameAsc",
        1,
        50,
        companyId
      );
      // Store updates → options update via useMemo
    } catch (error) {
      console.error("Failed to load salesmen:", error);
    }
  }, [search, companyId, filterUsers]);

  // Load when popover opens
  useEffect(() => {
    if (open && companyId) {
      loadUsers();
    }
  }, [open, companyId, loadUsers]);

  // Debounced search
  useEffect(() => {
    if (open && search.length >= 1) {
      const timer = setTimeout(loadUsers, 300);
      return () => clearTimeout(timer);
    }
  }, [search, open, loadUsers]);

  // Selected label
  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return "All Salesmen";
    const found = options.find((opt) => opt.value === value);
    return found?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <Command shouldFilter={false}>  {/* ← CRITICAL: Disable built-in filter */}
          <CommandInput
            placeholder="Search salesman..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                Loading...
              </CommandEmpty>
            ) : options.length === 0 ? (
              <CommandEmpty>No salesman found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}  // ← Use label for filtering!
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch("");
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

export default SearchableSalesmanSelect;