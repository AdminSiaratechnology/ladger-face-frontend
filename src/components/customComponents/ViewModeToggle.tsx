import React from 'react';
import { Eye, Table, Grid3X3 } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  totalItems?: number;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  setViewMode, 
  totalItems 
}) => {
  // Don't render if no items are available
  if (!totalItems || totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
      {/* View Mode Label */}
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
        <span className="text-gray-700 font-medium text-sm sm:text-base">View Mode:</span>
      </div>

      {/* Toggle Buttons */}
      <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner w-full sm:w-auto">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center justify-center flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
            viewMode === 'table' 
              ? 'bg-white text-teal-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Table className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Table</span>
          <span className="xs:hidden">Table</span>
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`flex items-center justify-center flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
            viewMode === 'cards' 
              ? 'bg-white text-teal-700 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Card View</span>
          <span className="xs:hidden">Cards</span>
        </button>
      </div>
    </div>
  );
};

export default ViewModeToggle;