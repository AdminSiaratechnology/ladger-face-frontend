// components/custom/ReportFilterBar.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReportDateRangeFilter from "./ReportDateRangeFilter";
import SearchableSalesmanSelect from "./SearchableSalesmanSelect";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
interface ReportFilterBarProps {
  localSearch: string;
  setLocalSearch: (value: string) => void;
  salesmanId: string;
  onSalesmanChange: (value: string) => void;
  companyId: string;
  status: string;
  onStatusChange: (value: string) => void;
  mode: string;
  onModeChange: (value: string) => void;
  localDateRange: { from?: Date; to?: Date };
  setLocalDateRange: (range: { from?: Date; to?: Date }) => void;
  applyDateRange: () => void;
  resetDateRange: () => void;
  onClearAll: () => void;
  isAnyFilterActive: boolean;
  isStatus: boolean;
  isModes: boolean;
}
const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  localSearch,
  setLocalSearch,
  salesmanId,
  onSalesmanChange,
  companyId,
  status,
  onStatusChange,
  mode,
  onModeChange,
  localDateRange,
  setLocalDateRange,
  applyDateRange,
  resetDateRange,
  onClearAll,
  isAnyFilterActive,
  isStatus = true,
  isModes = true,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Mobile Compact View */}
      <div className="p-4 space-y-3 lg:hidden">
        {/* Search + Salesman Row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="h-10 text-sm"
          />
          <SearchableSalesmanSelect
            value={salesmanId}
            onChange={onSalesmanChange}
            companyId={companyId}
            placeholder="Salesman"
          />
        </div>
        {/* Status + Mode Row */}
        <div className="grid grid-cols-2 gap-3">
          {isStatus && (
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          )}
          {isModes && (
            <Select value={mode} onValueChange={onModeChange}>
              <SelectTrigger className="h-10 text-sm">
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
          )}
        </div>
        {/* Date Range Full Width */}
        <ReportDateRangeFilter
          localDateRange={localDateRange}
          setLocalDateRange={setLocalDateRange}
          applyDateRange={applyDateRange}
          resetDateRange={resetDateRange}
        />
      </div>
      {/* Desktop Full View */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 p-5">
        <Input
          placeholder="Search customer / remarks..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-11"
        />
        <SearchableSalesmanSelect
          value={salesmanId}
          onChange={onSalesmanChange}
          companyId={companyId}
          placeholder="Search salesman..."
        />
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={mode} onValueChange={onModeChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All Modes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
        <ReportDateRangeFilter
          localDateRange={localDateRange}
          setLocalDateRange={setLocalDateRange}
          applyDateRange={applyDateRange}
          resetDateRange={resetDateRange}
        />
      </div>
      {/* Clear All Button (Always at bottom) */}
      {isAnyFilterActive && (
        <div className="px-4 pb-4 lg:px-5 lg:pb-5 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReportFilterBar;
