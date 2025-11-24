import { Button } from "../ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { CheckAccess } from "./CheckAccess";

interface ActionsDropdownProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  module: string;
  subModule: string;
  type?: string;
}

const ActionsDropdown = ({
  onView,
  onEdit,
  onDelete,
  module,
  subModule,
}: ActionsDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* View */}
      <CheckAccess module={module} subModule={subModule} type="read">
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          className="h-8 w-8 text-blue-600 hover:bg-blue-50"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </CheckAccess>

      {/* Edit */}
      <CheckAccess module={module} subModule={subModule} type="update">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-gray-700 hover:bg-gray-50"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </CheckAccess>

      {/* Delete */}
      {/* <CheckAccess module={module} subModule={subModule} type="delete">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CheckAccess> */}
    </div>
  );
};

export default ActionsDropdown;
