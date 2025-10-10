import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationData {
  total: number;
  limit: number;
  totalPages: number;
}

interface PaginationControlsProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  pagination?: PaginationData;
  itemName?: string;
  className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  setCurrentPage,
  pagination,
  itemName = "items",
  className = ""
}) => {
  
  
  if (!pagination || pagination?.totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pagination?.limit + 1;
  const endItem = Math.min(currentPage * pagination.limit, pagination.total);

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-lg shadow-sm ${className}`}>
      {/* Item Count - Top on mobile, left on desktop */}
      <div className="text-sm text-gray-600 text-center sm:text-left">
        Showing {startItem} - {endItem} of {pagination?.total} {itemName}
      </div>

      {/* Pagination Controls - Bottom on mobile, right on desktop */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Previous</span>
        </Button>

        {/* Page Info */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <span className="text-sm text-gray-600 sm:hidden">
            {currentPage}/{pagination.totalPages}
          </span>
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages, prev + 1))}
          disabled={currentPage === pagination?.totalPages}
          className="flex items-center gap-1 px-3 py-2"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;