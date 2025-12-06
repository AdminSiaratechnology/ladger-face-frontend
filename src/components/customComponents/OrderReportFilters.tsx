import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

type OrderStatus = 'all' | 'pending' | 'approved' | 'cancelled';

interface OrderReportFiltersState {
  page: number;
  limit: number;
  search: string;
  status: OrderStatus;
  userId: string;
  startDate?: string;
  endDate?: string;
}

interface OrderReportFiltersProps {
  users: User[];
  filters: OrderReportFiltersState;
  localSearch: string;
  setLocalSearch: (value: string) => void;
  localDateRange: DateRange;
  setLocalDateRange: (range: DateRange | undefined) => void;
  handleFilterChange: (key: keyof OrderReportFiltersState | 'startDate' | 'endDate', value: any) => void;
  applyDateRange: () => void;
  resetAllFilters: () => void;
}

const OrderReportFilters: React.FC<OrderReportFiltersProps> = ({
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
  const isFilterActive = useMemo(() =>
    localSearch?.length > 0 ||
    filters?.status !== 'all' ||
    filters?.userId !== 'all' ||
    !!localDateRange.from,
    [localSearch, filters?.status, filters?.userId, localDateRange?.from]
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">

        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-xs xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by Order ID or Customer..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 h-10 border-gray-300 focus-visible:ring-teal-500/50"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 flex-grow lg:flex-grow-0">

          <Select value={filters?.status} onValueChange={(v: OrderStatus) => handleFilterChange("status", v)}>
            <SelectTrigger className="w-[140px] h-10 border-gray-300 focus-visible:ring-teal-500/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters?.userId} onValueChange={(v) => handleFilterChange("userId", v)}>
            <SelectTrigger className="w-[160px] h-10 border-gray-300 focus-visible:ring-teal-500/50">
              <SelectValue placeholder="Salesman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Salesmen</SelectItem>
              {users?.map((s) => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger >
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal h-10 border-gray-300 hover:bg-gray-50",
                  !localDateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localDateRange?.from ? (
                  localDateRange?.to ? (
                    <>{format(localDateRange.from, "LLL dd, y")} - {format(localDateRange.to, "LLL dd, y")}</>
                  ) : format(localDateRange.from, "LLL dd, y")
                ) : <span>Pick a date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={localDateRange?.from}
                selected={localDateRange}
                onSelect={setLocalDateRange}
                numberOfMonths={2}
              />
              <div className="p-3 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalDateRange(undefined);
                    handleFilterChange("startDate", undefined);
                    handleFilterChange("endDate", undefined);
                  }}
                >
                  Reset Date
                </Button>
                <Button
                  size="sm"
                  onClick={applyDateRange}
                  disabled={!localDateRange?.from}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Apply Range
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear All */}
        <Button
          variant="ghost"
          onClick={resetAllFilters}
          className="h-10 w-full lg:w-auto flex-shrink-0 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default OrderReportFilters;