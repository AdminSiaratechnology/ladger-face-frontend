import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import { Badge } from "../ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { checkPermission } from "../../lib/utils";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";

const statuses = ["approved", "cancelled", "completed", "pending"];

const StatusDropdown = ({ orderId, status, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const { defaultSelected } = useCompanyStore();

  const companyId = defaultSelected?._id;

  // ✅ Check if user has update permission
  const canEdit = checkPermission({
    user,
    companyId,
    module: "Order",
    subModule: "Orders",
    type: "update",
  });

  // ✅ If no permissions → show only badge without dropdown
  if (!canEdit) {
    return (
      <div className="cursor-not-allowed opacity-60">
        <Badge className="bg-gray-200 text-gray-600">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>
    );
  }

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return;

    try {
      setLoading(true);
      // await api.updateOrderStatus({ orderId, status: newStatus });
      onStatusChange(newStatus);
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={styles[st] || ""}>
        {st.charAt(0).toUpperCase() + st.slice(1)}
      </Badge>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="cursor-pointer">
          {loading ? (
            <span className="text-xs text-gray-500">Updating...</span>
          ) : (
            getStatusBadge(status)
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40">
        {statuses.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleChange(s)}
            className={`cursor-pointer ${
              s === status ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
