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
  isCustomer: boolean
}

const SearchableCustomerSelect: React.FC<SearchableCustomerSelectProps> = ({
  value,
  onChange,
  placeholder = "Select customer...",
  className,
  companyId: propCompanyId,
  isCustomer = false
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { defaultSelected } = useCompanyStore();
  const finalCompanyId = propCompanyId || defaultSelected?._id;

  const { customers, loading, filterCustomers } = useCustomerStore();

  const loadCustomers = useCallback(async () => {
    if (!finalCompanyId) return;

    await filterCustomers(
      search,
      "",
      "",
      "",
      10,
      finalCompanyId
    );
  }, [search, finalCompanyId, filterCustomers]);

  useEffect(() => {
    if (open) loadCustomers();
  }, [open, loadCustomers]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(loadCustomers, 300);
    return () => clearTimeout(t);
  }, [search, open, loadCustomers]);

  const options = useMemo(() => {
    const customerOptions = customers.map((c: any) => ({
      value: c._id,
      label: c.customerName || c.contactPerson || c.name || "Unnamed Customer",
    }));

    return [{ value: "all", label: `${isCustomer ? "Select Customers" : "All Customers"}` }, ...customerOptions];
  }, [customers]);

  const selectedLabel = useMemo(() => {
    if (!value || value === "all") return `${isCustomer ?"Select Customers" : "All Customers" }`;
    return options.find(o => o.value === value)?.label || placeholder;
  }, [value, options, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* ✅ STABLE FULL-WIDTH TRIGGER */}
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
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0 opacity-60" />
              <span className="truncate">{selectedLabel}</span>
            </div>

            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-60" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </div>
      </PopoverTrigger>

      {/* ✅ DROPDOWN WIDTH = TRIGGER WIDTH */}
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
            placeholder="Search customer..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {loading ? (
              <CommandEmpty className="py-6 text-center">
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              </CommandEmpty>
            ) : options.length === 0 ? (
              <CommandEmpty>No customer found.</CommandEmpty>
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

export default SearchableCustomerSelect;
