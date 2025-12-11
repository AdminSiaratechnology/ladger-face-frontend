// components/custom/SearchableCustomerSelect.tsx
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
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerStore } from "../../../store/customerStore";
import { useCompanyStore } from "../../../store/companyStore";

interface SearchableCustomerSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  companyId?: string;
}

const SearchableCustomerSelect: React.FC<SearchableCustomerSelectProps> = ({
  value,
  onChange,
  placeholder = "Select customer...",
  className,
  companyId: propCompanyId,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { defaultSelected } = useCompanyStore();
  const finalCompanyId = propCompanyId || defaultSelected?._id;
  console.log(finalCompanyId,"finalCompanyId")

  const { customers, loading, fetchCustomers,filterCustomers } = useCustomerStore();

  const loadCustomers = useCallback(async () => {
    if (!finalCompanyId) return;

    try {
    //   await fetchCustomers({
    //     search,
    //     companyId: finalCompanyId,
    //     page: 1,
    //     limit: 100,
    //   });
     await  filterCustomers(
          search,
          "",
          "",
          "",
          10,
         finalCompanyId)
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  }, [search, finalCompanyId, fetchCustomers]);

  useEffect(() => {
    if (open && finalCompanyId) {
      loadCustomers();
    }
  }, [open, finalCompanyId, loadCustomers]);

  useEffect(() => {
    if (open && search.length >= 1) {
      const timer = setTimeout(() => {
        loadCustomers();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, open, loadCustomers]);

  const options = useMemo(() => {
    const customerOptions = customers.map((c: any) => ({
      value: c._id,
      label: c.contactPerson || c.name || "Unnamed Customer",
    }));

    return [
      { value: "all", label: "All Customers" },
      ...customerOptions,
    ];
  }, [customers]);

  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return "All Customers";
    const found = options.find((opt) => opt.value === value);
    return found?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen} className="w-full">
      <PopoverTrigger >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11 font-normal", className)}
        >
          <div className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 shrink-0 opacity-60" />
            <span className="truncate">{selectedLabel}</span>
          </div>
          {loading ? (
            // <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            <></>
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search customer..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                Loading customers...
              </CommandEmpty>
            ) : options.length === 0 ? (
              <CommandEmpty>No customer found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((option) => (
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

export default SearchableCustomerSelect;