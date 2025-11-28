// src/pages/CustomerGroupManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Users,
  Hash,
  FileText,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";

import CustomInputBox from "../customComponents/CustomInputBox";
import { useCustomerGroupStore } from "../../../store/CustomerGroupStore"; // Adjust path if needed
import { useCompanyStore } from "../../../store/companyStore";
import { formatSimpleDate } from "../../lib/formatDates";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { CheckAccess } from "../customComponents/CheckAccess";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import SelectedCompany from "../customComponents/SelectedCompany";
import UniversalInventoryDetailsModal from "../customComponents/UniversalInventoryDetailsModal";

interface CustomerGroup {
  _id: string;
  groupName: string;
  groupCode: string;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
}

const CustomerGroupManagement: React.FC = () => {
  // State
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"nameAsc" | "nameDesc" | "dateAsc" | "dateDesc">("dateDesc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 10;

  // Stores
  const {
    groups,
    counts,
    pagination,
    loading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useCustomerGroupStore();

  const { defaultSelected } = useCompanyStore();

  // Form state
const [formData, setFormData] = useState({
  groupName: "",
  status: "active" as const,
  parentGroup: null as string | null,
  companyId: "",
});

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({ groupName: "", status: "active", companyId: "" });
    setEditingGroup(null);
  }, []);

  // Load data when company changes
  useEffect(() => {
    if (defaultSelected?._id) {
      setFormData(prev => ({ ...prev, companyId: defaultSelected._id }));
      fetchGroups(defaultSelected._id);
    }
  }, [defaultSelected]);

  // Debounced search + filter + sort
  useEffect(() => {
    const timer = setTimeout(() => {
      if (defaultSelected?._id) {
        fetchGroups(defaultSelected._id, {
          search: searchTerm,
          status: statusFilter === "all" ? "" : statusFilter,
          sortBy: sortBy.includes("name") ? "groupName" : "createdAt",
          sortOrder: sortBy.includes("Desc") ? "desc" : "asc",
          page: currentPage,
          limit,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, sortBy, currentPage, defaultSelected]);

  // Handle Submit (Create / Update)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!formData.groupName.trim()) {
        toast.error("Group name is required");
        return;
      }

    const payload = {
  groupName: formData.groupName.trim(),
  status: formData.status,
  parentGroup: formData.parentGroup,
  companyId: formData.companyId,
};

      if (editingGroup) {
        await updateGroup(editingGroup._id, payload);
        toast.success("Customer group updated successfully");
      } else {
        await createGroup(payload);
        toast.success("Customer group created successfully");
      }

      setOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit
  const handleEdit = (group: CustomerGroup) => {
  setEditingGroup(group);
  setFormData({
    groupName: group.groupName,
    status: group.status,
    parentGroup: group.parentGroup,
    companyId: group.companyId,
  });
  setOpen(true);
};

  // Handle View
  const handleView = (group: CustomerGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // Stats (100% real-time)
  const stats = {
    totalGroups: counts?.total || 0,
    activeGroups: counts?.active || 0,
    inactiveGroups: counts?.inactive || 0,
  };

  // Table View
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            headers={["Group Name", "Group Code", "Status", "Created Date", "Actions"]}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {groups.map((group) => (
              <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{group.groupName}</td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="font-mono">
                    {group.groupCode}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={
                      group.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {group.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatSimpleDate(group.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <ActionsDropdown
                    onView={() => handleView(group)}
                    onEdit={() => handleEdit(group)}
                    onDelete={() => {
                      if (confirm("Are you sure you want to delete this group?")) {
                        deleteGroup(group._id);
                        toast.success("Group deleted");
                      }
                    }}
                    module="CustomerManagement"
                    subModule="CustomerGroup"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Card key={group._id} className="hover:shadow-xl transition-all duration-300 border border-gray-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {group.groupName}
              </CardTitle>
              <Badge
                className={
                  group.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }
              >
                {group.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              <span className="font-mono">{group.groupCode}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <FileText className="w-4 h-4 mr-2" />
              Created: {formatSimpleDate(group.createdAt)}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleView(group)}
              >
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(group)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm("Delete this group?")) {
                    deleteGroup(group._id);
                    toast.success("Group deleted");
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="custom-container py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient
          title="Customer Groups"
          subtitle="Manage and organize your customer categories"
          icon={Users}
        />

        <CheckAccess module="CustomerManagement" subModule="CustomerGroup" type="create">
          <Button
            onClick={() => {
              resetForm();
              if (defaultSelected?._id) {
                setFormData(prev => ({ ...prev, companyId: defaultSelected._id }));
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Customer Group
          </Button>
        </CheckAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Total Groups</p>
                <p className="text-4xl font-bold mt-2">{stats.totalGroups}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active</p>
                <p className="text-4xl font-bold mt-2">{stats.activeGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Inactive</p>
                <p className="text-4xl font-bold mt-2">{stats.inactiveGroups}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-purple-100 text-sm">Last Updated</p>
              <p className="text-lg font-semibold mt-2">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("all");
          setSortBy("dateDesc");
          setCurrentPage(1);
        }}
      />

      {/* Loading */}
      {loading && <TableViewSkeleton />}

      {/* View Toggle */}
      <div className="flex justify-between items-center my-6">
        <p className="text-sm text-gray-600">
          Showing {groups.length} of {pagination?.total || 0} groups
        </p>
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} totalItems={pagination?.total} />
      </div>

      

      {!loading && groups.length === 0 && (
        <EmptyStateCard
          icon={Users}
          title="No Customer Groups Found"
          description="Start by creating your first customer group"
          buttonLabel="Create Group"
          module="CustomerManagement"
          subModule="CustomerGroup"
          type="create"
          onButtonClick={() => setOpen(true)}
        />
      )}

      {/* Data View */}
      {!loading && groups.length > 0 && (
        <>
          {viewMode === "table" ? <TableView /> : <CardView />}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={pagination}
            itemName="groups"
          />
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <CustomFormDialogHeader
            title={editingGroup ? "Edit Customer Group" : "Create Customer Group"}
            subtitle={
              editingGroup
                ? "Update group information"
                : "Add a new group to categorize customers"
            }
          />

       {/* Inside DialogContent */}
<div className="space-y-6 py-4">
  <SelectedCompany />

  <CustomInputBox
    label="Group Name *"
    placeholder="e.g., South India Dealers"
    value={formData.groupName}
    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
    required
  />

  {/* NEW: Parent Group Dropdown */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Parent Group (Optional)
    </label>
    <select
      value={formData.parentGroup || ""}
      onChange={(e) => setFormData({ ...formData, parentGroup: e.target.value || null })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
    >
      <option value="">None (Root Group)</option>
      {groups
        .filter((g) => g._id !== editingGroup?._id)
        .map((group => (
          <option key={group._id} value={group._id}>
            {group.groupName} ({group.groupCode})
          </option>
        )))}
    </select>
    <p className="text-xs text-gray-500 mt-1">
      Choose a parent to create a sub-group (e.g., "South India" under "India")
    </p>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Status
    </label>
    <select
      value={formData.status}
      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

  <div className="flex justify-end gap-3 pt-4">
    <Button variant="outline" onClick={() => setOpen(false)}>
      Cancel
    </Button>
    <Button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      {isSubmitting ? "Saving..." : editingGroup ? "Update Group" : "Create Group"}
    </Button>
  </div>
</div>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <UniversalInventoryDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedGroup}
        type="customerGroup"
      />
    </div>
  );
};

export default CustomerGroupManagement;