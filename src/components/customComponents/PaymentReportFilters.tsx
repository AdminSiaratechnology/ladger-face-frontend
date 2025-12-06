// customComponents/PaymentReportFilters.tsx
import React, { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, X, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface User {
  _id: string;
  name: string;
}
interface DateRange {
  from?: Date;
  to?: Date;
}

interface PaymentReportFiltersProps {
  users: User[];
  filters: any;
  localSearch: string;
  setLocalSearch: (v: string) => void;
  localDateRange: DateRange;
  setLocalDateRange: (range: DateRange | undefined) => void;
  handleFilterChange: (key: string, value: any) => void;
  applyDateRange: () => void;
  resetAllFilters: () => void;
}

const PaymentReportFilters: React.FC<PaymentReportFiltersProps> = ({
  users,
  filters,
  localSearch,
  setLocalSearch,
  localDateRange,
  setLocalDateRange,
  handleFilterChange,
  applyDateRange,
  resetAllFilters,
}) => {
  const isFilterActive = useMemo(
    () =>
      localSearch?.length > 0 ||
      filters?.status !== "all" ||
      filters?.mode !== "all" ||
      filters?.userId !== "all" ||
      !!localDateRange.from,
    [localSearch, filters, localDateRange]
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col gap-4">
        {/* Search - Full width on mobile */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by remarks, transaction ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 h-11 text-sm"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Status */}
          <Select value={filters?.status} onValueChange={(v) => handleFilterChange("status", v)}>
            <SelectTrigger className="h-11 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="initiated">Initiated</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Mode */}
          <Select value={filters?.mode} onValueChange={(v) => handleFilterChange("mode", v)}>
            <SelectTrigger className="h-11 text-xs">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>

          {/* User */}
          <Select value={filters?.userId} onValueChange={(v) => handleFilterChange("userId", v)}>
            <SelectTrigger className="h-11 text-xs">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users?.map((u) => (
                <SelectItem key={u._id} value={u._id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range - Full width on mobile */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Popover>
              <PopoverTrigger >
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 text-xs",
                    !localDateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {localDateRange.from ? (
                      localDateRange.to ? (
                        <>
                          {format(localDateRange.from, "MMM dd")} -{" "}
                          {format(localDateRange.to, "MMM dd, y")}
                        </>
                      ) : (
                        format(localDateRange.from, "MMM dd, y")
                      )
                    ) : (
                      "Pick date range"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={localDateRange}
                  onSelect={setLocalDateRange}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
                <div className="p-3 border-t flex justify-end gap-2 bg-gray-50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocalDateRange(undefined);
                      handleFilterChange("startDate", undefined);
                      handleFilterChange("endDate", undefined);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyDateRange}
                    disabled={!localDateRange.from}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear All Button */}
        {isFilterActive && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReportFilters;