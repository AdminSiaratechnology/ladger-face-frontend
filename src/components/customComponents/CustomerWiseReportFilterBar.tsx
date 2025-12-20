import React, { useState, useCallback, useEffect } from "react";
import SearchableCustomerSelect from "./SearchableCustomerSelect";
import SearchableSalesmanSelect from "./SearchableSalesmanSelect";
import ReportDateRangeFilter from "./ReportDateRangeFilter";
import { Filter, FilterX, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ✅ FIX 1: Explicitly Export this Interface
export interface FilterValues {
  customerId: string;
  salesmanId: string;
  status: string;
  mode: string;
}

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
  
  // ✅ FIX 2: Callback accepts the values directly
  onApplyFilters: (values: FilterValues) => void;
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
  // Local Temp State
  const [tempCustomerId, setTempCustomerId] = useState(customerId || "all");
  const [tempSalesmanId, setTempSalesmanId] = useState(salesmanId || "all");
  const [tempStatus, setTempStatus] = useState(status || "all");
  const [tempMode, setTempMode] = useState(mode || "all");

  // Modal Open State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state when props change
  useEffect(() => { setTempCustomerId(customerId || "all"); }, [customerId]);
  useEffect(() => { setTempSalesmanId(salesmanId || "all"); }, [salesmanId]);
  useEffect(() => { setTempStatus(status || "all"); }, [status]);
  useEffect(() => { setTempMode(mode || "all"); }, [mode]);

  // Validation
  const isCustomerValid = tempCustomerId && tempCustomerId !== "all";

  // Active Count for Badge
  const activeCount = [
    tempCustomerId !== "all",
    tempSalesmanId !== "all",
    tempStatus !== "all",
    tempMode !== "all",
    localDateRange?.from !== undefined
  ].filter(Boolean).length;

  const handleApply = useCallback(() => {
    if (showCustomer && !isCustomerValid) return;

    // Update Props for UI Sync
    onCustomerChange(tempCustomerId);
    onSalesmanChange(tempSalesmanId);
    onStatusChange(tempStatus);
    onModeChange(tempMode);

    // ✅ FIX 3: Pass values directly to bypass state lag
    onApplyFilters({
      customerId: tempCustomerId,
      salesmanId: tempSalesmanId,
      status: tempStatus,
      mode: tempMode
    });

    setIsModalOpen(false); 
  }, [
    tempCustomerId, tempSalesmanId, tempStatus, tempMode,
    isCustomerValid, showCustomer,
    onCustomerChange, onSalesmanChange, onStatusChange, onModeChange, onApplyFilters,
  ]);

  const handleClear = useCallback(() => {
    setTempCustomerId("all");
    setTempSalesmanId("all");
    setTempStatus("all");
    setTempMode("all");
    
    // Set Date Range: 1st of Last Month -> Today
    const today = new Date();
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    setLocalDateRange({
      from: firstDayLastMonth,
      to: today
    });

    onClearAll();
  }, [onClearAll, setLocalDateRange]);

  // --- RENDER INPUTS (Unified Grid) ---
  const renderInputs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
      {/* CUSTOMER */}
      {showCustomer && (
        <div className="w-full relative col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
            Customer <span className="text-red-500 ml-1">*</span>
          </label>
          <div className={cn("rounded-md transition-all", !isCustomerValid ? "ring-1 ring-red-200" : "")}>
            <SearchableCustomerSelect
              value={tempCustomerId}
              onChange={setTempCustomerId}
              companyId={companyId}
              placeholder="Select Customer"
              className="w-full flex"
            />
          </div>
          {!isCustomerValid && <p className="text-xs text-red-500 mt-1">Selection required</p>}
        </div>
      )}

      {/* SALESMAN */}
      {showSalesman && (
        <div className="w-full col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Salesman</label>
          <SearchableSalesmanSelect
            value={tempSalesmanId}
            onChange={setTempSalesmanId}
            companyId={companyId}
            placeholder="All Salesmen"
            className="w-full flex"
          />
        </div>
      )}

      {/* STATUS */}
      {showStatus && (
        <div className="w-full col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <Select value={tempStatus} onValueChange={setTempStatus}>
            <SelectTrigger className="h-10 w-full bg-white border-gray-200">
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

      {/* MODE */}
      {showMode && (
        <div className="w-full col-span-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
          <Select value={tempMode} onValueChange={setTempMode}>
            <SelectTrigger className="h-10 w-full bg-white border-gray-200">
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

      {/* DATE RANGE */}
      <div className="w-full col-span-1 md:col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
        <div className="w-full">
          <ReportDateRangeFilter
            localDateRange={localDateRange}
            setLocalDateRange={setLocalDateRange}
            applyDateRange={applyDateRange}
            resetDateRange={resetDateRange}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        
        {/* Warning Banner */}
        {showCustomer && !isCustomerValid ? (
           <div className="flex-1 w-full flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Please filter to select a customer.</p>
           </div>
        ) : (
           <div className="flex-1 hidden sm:block" /> 
        )}

        {/* Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {isAnyFilterActive && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 border-red-200 h-11"
            >
              <FilterX className="w-4 h-4 mr-2" />
              <span className="sm:inline hidden">Clear</span>
            </Button>
          )}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "flex-1 sm:flex-none h-11 border-gray-300 shadow-sm min-w-[140px] justify-between px-4",
                  showCustomer && !isCustomerValid ? "bg-white" : "bg-white"
                )}
              >
                <div className="flex items-center text-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Filter Report</span>
                </div>
                {activeCount > 0 && (
                  <Badge className="ml-2 bg-teal-600 text-white hover:bg-teal-700 h-6 px-2 rounded-full">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            
            <DialogContent className="w-[95%] sm:max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
              <DialogHeader className="px-6 py-5 border-b bg-gray-50/80 sticky top-0 z-10 backdrop-blur-md">
                <DialogTitle className="flex items-center text-lg font-bold text-gray-800">
                  <Filter className="w-5 h-5 mr-2 text-teal-600" />
                  Filter Options
                </DialogTitle>
              </DialogHeader>

              <div className="p-6">
                 {renderInputs()}
              </div>

              <DialogFooter className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end sticky bottom-0">
                 {isAnyFilterActive && (
                  <Button 
                    variant="ghost" 
                    onClick={handleClear} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Reset All
                  </Button>
                 )}
                 <Button 
                   className={cn(
                     "w-full sm:w-auto text-white shadow-md",
                     showCustomer && !isCustomerValid ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"
                   )}
                   disabled={showCustomer && !isCustomerValid}
                   onClick={handleApply}
                 >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   Apply Filters
                 </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ReportFilterBar;