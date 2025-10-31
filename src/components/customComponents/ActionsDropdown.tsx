import { useState } from "react";
import { Button } from "../ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { CheckAccess } from "./CheckAccess";

interface ActionsDropdownProps {
  onEdit: () => void;
  onDelete: () => void;
  module:string,
  subModule:string,
  type?:string
}

const ActionsDropdown = ({ onEdit, onDelete,module ,subModule }: ActionsDropdownProps) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowActions(!showActions)}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {showActions && (
        <>
          {/* Overlay to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowActions(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-4 -mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <CheckAccess module={module} subModule={subModule} type="update">
            <Button
                
                variant="ghost"
                size="sm"
                onClick={() => {
                    onEdit();
                    setShowActions(false);
                }}
                className="w-full justify-start text-left hover:bg-gray-50 rounded-none"
                >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
                </CheckAccess>
 <CheckAccess module={module} subModule={subModule} type="delete">

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                className="w-full justify-start text-left rounded-none text-red-600 hover:bg-red-50"
                >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
                </CheckAccess>
          </div>
        </>
      )}
    </div>
  );
};

export default ActionsDropdown;
