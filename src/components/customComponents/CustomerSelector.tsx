import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useCustomerStore } from "../../../store/customerStore";

interface CustomerDropdownProps {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
}

export default function CustomerDropdown({
  selectedCustomerId,
  setSelectedCustomerId,
}: CustomerDropdownProps) {
  const { customers, fetchCustomers, pagination, loading } = useCustomerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers(1, 20, search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Initial load
  useEffect(() => {
    fetchCustomers(1, 20, "");
  }, []);

  // Infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop + target.clientHeight >= target.scrollHeight - 50 &&
      !loading &&
      page < pagination.totalPages
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCustomers(nextPage, 20, search);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  return (
    <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
      {/* <label className="text-sm font-medium text-gray-700">Customer</label> */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border rounded-md px-3 py-2 flex justify-between items-center text-sm focus:ring-2 focus:ring-teal-400"
      >
        {selectedCustomer ? selectedCustomer.customerName : "-- Select a Customer --"}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-10">
          {/* Search box */}
          {/* <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div> */}

          {/* Scrollable list */}
          <div
            className="max-h-60 overflow-y-auto text-sm"
            onScroll={handleScroll}
          >
            {customers.map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  setSelectedCustomerId(c._id);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 cursor-pointer hover:bg-teal-50 ${
                  selectedCustomerId === c._id ? "bg-teal-100" : ""
                }`}
              >
                {c.customerName}
              </div>
            ))}

            {loading && (
              <div className="flex justify-center items-center py-2 text-gray-500 text-xs">
                <Loader2 className="animate-spin w-4 h-4 mr-1" /> Loading...
              </div>
            )}

            {!loading && customers.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-3">
                No customers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
