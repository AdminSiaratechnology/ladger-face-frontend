import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import { User2Icon } from "lucide-react";

const UserSelection = () => {
  const location = useLocation();
  const { companyId, selectedRoute } = location.state || {};
  const { companies } = useCompanyStore();
  const { filterUsers, users, loading } = useUserManagementStore();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const navigate = useNavigate();
  const company = companies.find((c) => c._id === companyId);

  // 🔹 Fetch only users with role "customer"
  useEffect(() => {
    filterUsers("", "customer", "all", "nameAsc", 1, 100);
  }, [filterUsers]);
  const selectedUser = users.find((u) => u._id === selectedUserId);

  const handleContinue = () => {
    if (selectedUser && companyId && selectedRoute) {
      navigate("/select-products", {
        state: {
          selectedUser,
          companyId,
          selectedRoute,
          company,
        },
      });
    }
  };
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-gray-200 pb-2 mt-2">
        <span className="text-xl font-semibold text-teal-500">New Order</span>
        <h1 className="text-gray-500">
          {company?.namePrint} & {selectedRoute}
        </h1>
      </div>

      {/* Customer Selection */}
      <div className="flex flex-col gap-2">
        <label className=" text-teal-500 flex items-center gap-0.5"><User2Icon className="w-5 h-5"/> Select Customer</label>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading customers...</div>
        ) : users.length === 0 ? (
          <div className="text-gray-400 text-sm">No customers found.</div>
        ) : (
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="">-- Select a Customer --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedUser && (
        <div className="mt-4 border rounded-lg p-4 bg-gray-50 shadow-sm">
          <h2 className="text-lg font-semibold text-teal-600 mb-2">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Name: </span>
              {selectedUser.name}
            </div>
            <div>
              <span className="font-medium">Email: </span>
              {selectedUser.email}
            </div>
            <div>
              <span className="font-medium">Phone: </span>
              {selectedUser.phone || "N/A"}
            </div>
            <div>
              <span className="font-medium">Area: </span>
              {selectedUser.area || "N/A"}
            </div>
            <div>
              <span className="font-medium">Pincode: </span>
              {selectedUser.pincode || "N/A"}
            </div>
            <div>
              <span className="font-medium">Status: </span>
              <span
                className={`${
                  selectedUser.status === "active"
                    ? "text-green-600"
                    : "text-red-500"
                } font-medium`}
              >
                {selectedUser.status}
              </span>
            </div>
            {/* <div>
              <span className="font-medium">Created At: </span>
              {new Date(selectedUser.createdAt).toLocaleDateString()}
            </div> */}
            {/* <div>
              <span className="font-medium">Last Login: </span>
              {selectedUser.lastLogin
                ? new Date(selectedUser.lastLogin).toLocaleString()
                : "Never"}
            </div> */}
          </div>
        </div>
      )}
      {selectedUser && (
        <button
          onClick={handleContinue}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white px-4 py-3 pr-4 rounded-lg font-semibold shadow-md transition-all duration-150 cursor-pointer"
        >
          Continue with Products →
        </button>
      )}
    </div>
  );
};

export default UserSelection;
