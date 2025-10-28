import React from "react";
import { Search, Filter, ArrowUpDown, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: "all" | "active" | "inactive" | "maintenance";
  setStatusFilter: (value: "all" | "active" | "inactive") => void;
  sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc";
  setSortBy: (value: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc") => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onClearFilters,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== "all" || sortBy !== "dateDesc";

  // Hack to prevent autofill: force empty value on mount
  React.useEffect(() => {
    setSearchTerm("");
  }, []);

  const preventAutofill = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    (e.target as HTMLInputElement).value = "";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm mb-3">
      {/* Mobile Layout */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={preventAutofill}
            className="pl-10 pr-10 bg-white/50 border-gray-200 rounded-xl"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
            name="company-search"
            role="searchbox"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="relative flex-1">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc")}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="nameAsc">A → Z</option>
              <option value="nameDesc">Z → A</option>
              <option value="dateAsc">Oldest</option>
              <option value="dateDesc">Newest</option>
            </select>
          </div>
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-teal-600 hover:bg-teal-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={preventAutofill}
            className="pl-10 pr-10 bg-white/50 border-gray-200 rounded-xl transition-all duration-200 focus:bg-white"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form-type="other"
            name="company-search"
            role="searchbox"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="pl-10 pr-8 py-2 bg-white/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 hover:bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc")}
              className="pl-10 pr-8 py-2 bg-white/50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 hover:bg-white"
            >
              <option value="nameAsc">A → Z</option>
              <option value="nameDesc">Z → A</option>
              <option value="dateAsc">Oldest First</option>
              <option value="dateDesc">Newest First</option>
            </select>
          </div>

          {/* Clear Button - Only show when filters are active */}
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 text-xs text-teal-600">
          <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
          <span>Filters active</span>
        </div>
      )}
    </div>
  );
};

export default FilterBar;