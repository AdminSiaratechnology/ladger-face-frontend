// components/custom/ReportDateRangeFilter.tsx
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, FilterX } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PopoverClose } from "@radix-ui/react-popover";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ReportDateRangeFilterProps {
  localDateRange: DateRange;
  setLocalDateRange: (range: DateRange | undefined) => void;
  applyDateRange: () => void;
  resetDateRange: () => void;
  className?: string;
}

const ReportDateRangeFilter: React.FC<ReportDateRangeFilterProps> = ({
  localDateRange,
  setLocalDateRange,
  applyDateRange,
  resetDateRange,
  className,
}) => {
  const isActive = useMemo(() => !!localDateRange?.from, [localDateRange?.from]);

  const displayText = useMemo(() => {
    if (!localDateRange?.from) return "Pick date range";
    if (localDateRange?.to) {
      return `${format(localDateRange?.from, "dd MMM")} - ${format(localDateRange?.to, "dd MMM yyyy")}`;
    }
    return format(localDateRange?.from, "dd MMM yyyy");
  }, [localDateRange]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Popover>
        <PopoverTrigger >
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[280px] justify-start text-left font-normal h-11 px-4 border-gray-300 hover:bg-gray-50",
              !localDateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={localDateRange}
            onSelect={setLocalDateRange}
            numberOfMonths={2}
            initialFocus
            maxDate={new Date()}
            disabled={(date) => date > new Date()}
          />
          <div className="flex justify-between p-3 border-t bg-gray-50">
            <Button variant="ghost" size="sm" onClick={resetDateRange}>
              Reset
            </Button>
            <PopoverClose asChild>
              <Button
                size="sm"
                onClick={applyDateRange}
                disabled={!localDateRange?.from}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Apply
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>

      {isActive && (
        <Button
          variant="ghost"
          size="icon"
          onClick={resetDateRange}
          className="h-11 w-11 border border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ReportDateRangeFilter;