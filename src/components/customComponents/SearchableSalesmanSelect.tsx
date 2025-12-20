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

  const options = useMemo(() => {
    const userOptions = users.map((u: any) => ({
      value: u._id,
      label: u.name,
    }));

    return [{ value: "all", label: "All Salesmen" }, ...userOptions];
  }, [users]);

  const loadUsers = useCallback(async () => {
    if (!companyId) return;

    await filterUsers(
      search,
      "all",
      "all",
      "nameAsc",
      1,
      50,
      companyId
    );
  }, [search, companyId, filterUsers]);

  useEffect(() => {
    if (open) loadUsers();
  }, [open, loadUsers]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [search, open, loadUsers]);

  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return "All Salesmen";
    return options.find(o => o.value === value)?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* ✅ STABLE TRIGGER */}
      <PopoverTrigger asChild>
        <div className="w-full">
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-11 justify-between font-normal",
              className
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-60" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </div>
      </PopoverTrigger>

      {/* ✅ CORRECT WIDTH DROPDOWN */}
      <PopoverContent
            align="start"
  sideOffset={4}
  className="p-0"
  style={{
    width: "var(--radix-popover-trigger-width)",
  }}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search salesman..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {loading ? (
              <CommandEmpty className="py-6 text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
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
