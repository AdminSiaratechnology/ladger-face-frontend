// components/custom/ReportFilterBar.tsx
import React, { useState, useCallback } from "react";
import SearchableCustomerSelect from "./SearchableCustomerSelect";
import SearchableSalesmanSelect from "./SearchableSalesmanSelect";
import ReportDateRangeFilter from "./ReportDateRangeFilter";
import { FilterX, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFilterBarProps {
  customerId: string;
  onCustomerChange: (value: string) => void;
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
  showCustomer?: boolean;
  showSalesman?: boolean;
  showStatus?: boolean;
  showMode?: boolean;
  onApplyFilters: () => void; // New: Trigger full apply
}

const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  customerId,
  onCustomerChange,
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
  onApplyFilters,
  showCustomer = true,
  showSalesman = true,
  showStatus = true,
  showMode = true,
}) => {
  const [tempCustomerId, setTempCustomerId] = useState(customerId || "all");
  const [tempSalesmanId, setTempSalesmanId] = useState(salesmanId || "all");
  const [tempStatus, setTempStatus] = useState(status || "all");
  const [tempMode, setTempMode] = useState(mode || "all");

  // Apply all filters at once
  const handleApply = useCallback(() => {
    onCustomerChange(tempCustomerId);
    onSalesmanChange(tempSalesmanId);
    onStatusChange(tempStatus);
    onModeChange(tempMode);
    applyDateRange(); // Apply date range too
    onApplyFilters(); // Trigger parent re-fetch
  }, [
    tempCustomerId,
    tempSalesmanId,
    tempStatus,
    tempMode,
    onCustomerChange,
    onSalesmanChange,
    onStatusChange,
    onModeChange,
    applyDateRange,
    onApplyFilters,
  ]);

  const handleClear = useCallback(() => {
    setTempCustomerId("all");
    setTempSalesmanId("all");
    setTempStatus("all");
    setTempMode("all");
    resetDateRange();
    onClearAll();
  }, [resetDateRange, onClearAll]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Desktop View */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 p-5">
        {showCustomer && (
          <div className="w-full ">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer
            </label>
            <SearchableCustomerSelect
              value={tempCustomerId}
              onChange={setTempCustomerId}
              companyId={companyId}
              placeholder="All Customers"
              className=" w-56 flex-1 flex"
            />
          </div>
        )}

        {showSalesman && (
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Salesman
            </label>
            <SearchableSalesmanSelect
              value={tempSalesmanId}
              onChange={setTempSalesmanId}
              companyId={companyId}
              placeholder="All Salesmen"
               className=" w-56 flex-1 flex"
            />
          </div>
        )}

        {showStatus && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <Select value={tempStatus} onValueChange={setTempStatus}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {showMode && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Mode
            </label>
            <Select value={tempMode} onValueChange={setTempMode}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date Range
          </label>
          <ReportDateRangeFilter
            localDateRange={localDateRange}
            setLocalDateRange={setLocalDateRange}
            applyDateRange={applyDateRange}
            resetDateRange={resetDateRange}
          />
        </div>
      </div>

      {/* Mobile View */}
      <div className="p-4 space-y-4 lg:hidden">
        {showCustomer && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <SearchableCustomerSelect
              value={tempCustomerId}
              onChange={setTempCustomerId}
              companyId={companyId}
            />
          </div>
        )}

        {showSalesman && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salesman
            </label>
            <SearchableSalesmanSelect
              value={tempSalesmanId}
              onChange={setTempSalesmanId}
              companyId={companyId}
            />
          </div>
        )}

        {/* Add other mobile filters as needed */}
      </div>

      {/* Action Buttons - Always Visible */}
      <div className="border-t border-gray-200 px-5 py-4 flex flex-col sm:flex-row gap-3 justify-end">
        {isAnyFilterActive && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-red-600 hover:bg-red-50 border-red-200"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}

        <Button
          onClick={handleApply}
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-md"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default ReportFilterBar;