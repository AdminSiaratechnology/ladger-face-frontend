import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Settings2, Upload, Download, FileDown } from "lucide-react";

interface SettingsDropdownProps {
  onImport?: () => void;
  onExport?: () => void;
  onSample?: () => void;
  disabled?: boolean;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  onImport,
  onExport,
  onSample,
  disabled = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-all"
          disabled={disabled}
          title="More options"
        >
          <Settings2 className="h-4 w-4 text-gray-600" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-xl">
        <DropdownMenuItem
          onClick={onImport}
          className="flex items-center gap-3 cursor-pointer text-sm font-medium hover:bg-teal-50 focus:bg-teal-50"
        >
          <Upload className="h-4 w-4 text-teal-600" />
          Import Data
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onExport}
          className="flex items-center gap-3 cursor-pointer text-sm font-medium hover:bg-teal-50 focus:bg-teal-50"
        >
          <Download className="h-4 w-4 text-teal-600" />
          Export Data
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onSample}
          className="flex items-center gap-3 cursor-pointer text-sm font-medium hover:bg-teal-50 focus:bg-teal-50"
        >
          <FileDown className="h-4 w-4 text-teal-600" />
          Download Sample
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsDropdown;