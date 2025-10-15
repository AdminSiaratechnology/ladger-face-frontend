import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Users,
  UserPlus,
  Shield,
  Settings2,
  Plus,
  X,
  Eye,
  Trash2,
  Building2,
  Key,
  Lock,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  Edit,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useCompanyStore } from "../../../store/companyStore";
import { useUserManagementStore } from "../../../store/userManagementStore";
import { timeAgo } from "../../lib/timeAgo";
import CustomInputBox from "../customComponents/CustomInputBox";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import { toast } from "sonner";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import HeaderGradient from "../customComponents/HeaderGradint";
import MultiStepNav from "../customComponents/MultiStepNav";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import SelectedCompany from "../customComponents/SelectedCompany";

// Interfaces (unchanged from original)
interface Company {
  id: string;
  _id: string;
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  msmeNumber: string;
  udyamNumber: string;
  defaultCurrency: string;
  banks: Bank[];
  logo: any;
  notes: string;
  createdAt: string;
  registrationDocs: any[];
}

interface Bank {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  micrNumber: string;
  bankName: string;
  branch: string;
}

interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  extra: string[];
}

interface Module {
  [key: string]: Permission;
}

interface ModuleAccess {
  [moduleName: string]: Module;
}

interface Access {
  company: string;
  modules: ModuleAccess;
}

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  subRole: string[];
  allPermissions: boolean;
  parent: string;
  createdBy: string;
  clientAgent: string;
  company?: string;
  access: Access[];
  phone?: string;
  area?: string;
  pincode?: string;
  status?: "active" | "inactive";
  lastLogin?: string;
  createdAt?: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  subRole: string[];
  allPermissions: boolean;
  parent: string;
  createdBy?: string;
  clientAgent: string;
  company?: string;
  access: Access[];
  phone: string;
  area: string;
  pincode: string;
}

// Step Icons for MultiStepNav
const stepIcons = {
  basic: <Users className="w-2 h-2 md:w-5 md:h-5" />,
  role: <Shield className="w-2 h-2 md:w-5 md:h-5" />,
  permissions: <Key className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

export const UserManagement: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page

  const { defaultSelected, companies } = useCompanyStore();
  const {
    addUser,
    fetchUsers,
    users,
    loading,
    error,
    editUser,
    deleteUser,
    filterUsers,
    pagination,
  } = useUserManagementStore();

  // Initial fetch
  useEffect(() => {
    fetchUsers(currentPage, limit);
  }, [fetchUsers, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterUsers(
        searchTerm,
        roleFilter,
        statusFilter,
        "nameAsc",
        currentPage,
        limit
      )
        .then((result) => {
          setFilteredUsers(result);
        })
        .catch((err) => {
          console.error("Error filtering users:", err);
          toast.error("Failed to filter users");
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, roleFilter, statusFilter, currentPage, filterUsers]);

  // Roles and Sub-roles (unchanged)
  const roles = ["Salesman", "Customer", "Admin"];
  const subRoles = {
    Salesman: ["salesman"],
    Customer: ["customer"],
    Admin: [
      "Admin",
      "InventoryManager",
      "SalesManager",
      "PurchaseManager",
      "HRManager",
      "FinanceManager",
    ],
  };

  // Available modules (unchanged)
  const availableModules = {
    BusinessManagement: {
      CustomerRegistration: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Vendor: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Agent: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Ledger: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
    UserManagement: {
      User: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
    InventoryManagement: {
      Godown: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      StockGroup: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      StockCategory: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Product: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Unit: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Order: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Payment: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
    Pricing: {
      PriceList: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      Discount: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
    Reports: {
      SalesReport: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
      PurchaseReport: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
    Order: {
      Orders: {
        create: false,
        read: false,
        update: false,
        delete: false,
        extra: [],
      },
    },
  };
  const company = companies.find((c) => c._id === defaultSelected);

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "",
    subRole: [],
    allPermissions: false,
    parent: "",
    createdBy: "",
    clientAgent: "",
    company: "",
    access: [],
    phone: "",
    area: "",
    pincode: "",
  });
  useEffect(() => {
    if (defaultSelected && companies.length > 0) {
      const selectedCompany = companies.find((c) => c._id === defaultSelected);
      if (selectedCompany) {
        setForm((prev) => ({ ...prev, company: selectedCompany._id }));
      }
    }
  }, [defaultSelected, companies]);
  // Initialize access with all companies
  useEffect(() => {
    if (!isEditing) {
      setForm((prev) => ({
        ...prev,
        access: companies.map((company) => ({
          company: company._id,
          modules: {},
        })),
      }));
    }
  }, [companies, isEditing]);

  // Function to set all permissions
  const setAllPermissions = (enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      access: prev.access.map((access) => ({
        ...access,
        modules: Object.fromEntries(
          Object.entries(availableModules).map(([moduleName, subModules]) => [
            moduleName,
            Object.fromEntries(
              Object.keys(subModules).map((subModuleName) => [
                subModuleName,
                {
                  create: enabled,
                  read: enabled,
                  update: enabled,
                  delete: enabled,
                  extra: [],
                },
              ])
            ),
          ])
        ),
      })),
    }));
  };

  // Effect for role change
  useEffect(() => {
    if (form.role === "Admin") {
      setAllPermissions(true);
    } else {
      setAllPermissions(false);
      // Set default permissions for Salesman and Customer
      const defaultPermissions =
        form.role === "Salesman"
          ? {
              // Example defaults for Salesman
              BusinessManagement: {
                CustomerRegistration: {
                  create: true,
                  read: true,
                  update: true,
                  delete: false,
                  extra: [],
                },
                Vendor: {
                  create: false,
                  read: true,
                  update: false,
                  delete: false,
                  extra: [],
                },
                // ... other defaults
              },
              InventoryManagement: {
                Product: {
                  create: false,
                  read: true,
                  update: false,
                  delete: false,
                  extra: [],
                },
                // ... etc
              },
              // Add more as needed
            }
          : {
              // Defaults for Customer - even less
              Order: {
                Orders: {
                  create: false,
                  read: true,
                  update: false,
                  delete: false,
                  extra: [],
                },
              },
              // ... etc
            };

      setForm((prev) => ({
        ...prev,
        access: prev.access.map((access) => ({
          ...access,
          modules: JSON.parse(JSON.stringify(defaultPermissions)), // Deep copy
        })),
      }));
    }
  }, [form.role]);

  // Reset form function
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      subRole: [],
      allPermissions: false,
      parent: "",
      createdBy: "",
      clientAgent: "",
      company: "",
      access: companies.map((company) => ({
        company: company._id,
        modules: {},
      })),
      phone: "",
      area: "",
      pincode: "",
    });
    setEditingUser(null);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: keyof UserForm, value: string): void => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubRoleChange = (subRole: string, checked: boolean): void => {
    setForm((prev) => ({
      ...prev,
      subRole: checked
        ? [...prev.subRole, subRole]
        : prev.subRole.filter((sr) => sr !== subRole),
    }));
  };

  const handlePermissionChange = (
    companyId: string,
    moduleName: string,
    subModuleName: string,
    permissionType: keyof Permission,
    value: boolean | string[]
  ): void => {
    setForm((prev) => {
      const updatedAccess = prev.access.map((a) => {
        if (a.company !== companyId) return a;

        const updatedModules = { ...a.modules };
        if (!updatedModules[moduleName]) {
          updatedModules[moduleName] = {};
        }
        if (!updatedModules[moduleName][subModuleName]) {
          updatedModules[moduleName][subModuleName] = {
            create: false,
            read: false,
            update: false,
            delete: false,
            extra: [],
          };
        }
        updatedModules[moduleName][subModuleName][permissionType] = value;

        return { ...a, modules: updatedModules };
      });

      return { ...prev, access: updatedAccess };
    });
  };

  const handleToggleAllPermissions = (
    companyId: string,
    moduleKey: string,
    subModuleKey: string,
    enabled: boolean
  ): void => {
    ["create", "read", "update", "delete"].forEach((perm) => {
      handlePermissionChange(
        companyId,
        moduleKey,
        subModuleKey,
        perm as keyof Permission,
        enabled
      );
    });
  };

  const handleSubmit = (): void => {
    if (!form.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!form.pincode.trim()) {
      toast.error("Please enter Pincode");
      return;
    }
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(form.pincode.trim())) {
      toast.error("Pincode must be a 6-digit number");
      return;
    }

    if (!isEditing && !form.password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    if (!form.role) {
      toast.error("Please select a role");
      return;
    }

    const userData: User = {
      ...form,
      id: editingUser?._id || Date.now().toString(),
      status: editingUser?.status || "active",
      lastLogin: editingUser?.lastLogin || "Never",
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      createdBy: form.createdBy || "current_user_id", // Replace with actual user ID
      parent: form.parent || "",
      clientAgent: form.clientAgent || "",
      company: form.company || "",
    };

    if (isEditing && editingUser) {
      editUser(editingUser._id || "", userData);
      toast.success("User updated successfully");
    } else {
      addUser(userData);
      toast.success("User created successfully");
    }

    resetForm();
    setOpen(false);
    setActiveTab("basic");
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditing(true);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Don't pre-fill password for security
      role: user.role,
      subRole: user.subRole,
      allPermissions: user.allPermissions,
      parent: user.parent,
      clientAgent: user.clientAgent,
      company: user.company || "",
      access:
        user.access.length > 0
          ? user.access
          : companies.map((c) => ({ company: c._id, modules: {} })),
      phone: user.phone || "",
      area: user.area || "",
      pincode: user.pincode || "",
    });
    setOpen(true);
    setActiveTab("basic");
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
      toast.success("User deleted successfully");
    }
  };

  const handleToggleStatus = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const updatedUser = {
        ...user,
        status: user.status === "active" ? "inactive" : "active",
      };
      editUser(userId, updatedUser);
      toast.success(`User status changed to ${updatedUser.status}`);
    }
  };

  // Statistics
  const stats = useMemo(
    () => ({
      totalUsers: pagination.total,
      activeUsers:
        statusFilter === "active"
          ? pagination.total
          : filteredUsers.filter((u) => u.status === "active").length,
      adminUsers:
        roleFilter === "Admin"
          ? pagination.total
          : filteredUsers.filter((u) => u.role === "Admin").length,
      salesUsers:
        roleFilter === "Salesman"
          ? pagination.total
          : filteredUsers.filter((u) => u.role === "Salesman").length,
      agentUsers:
        roleFilter === "Customer"
          ? pagination.total
          : filteredUsers.filter((u) => u.role === "Customer").length,
    }),
    [filteredUsers, pagination, statusFilter, roleFilter]
  );

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "role", label: "Role & Sub-Role" },
    { id: "permissions", label: "Permissions" },
    { id: "settings", label: "Settings" },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Salesman":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "Customer":
        return "bg-gradient-to-r from-indigo-500 to-blue-500 text-white";
      case "Admin":
        return "bg-gradient-to-r from-gray-500 to-slate-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-700 text-white";
    }
  };

  const getCompanyName = (companyId: string) => {
    return (
      companies.find((c) => c?._id === companyId)?.namePrint ||
      "Unknown Company"
    );
  };

  const getPermissionForCompany = (
    companyId: string,
    moduleName: string,
    subModuleName: string,
    permissionType: keyof Permission
  ) => {
    const access = form.access.find((a) => a.company === companyId);
    return (
      access?.modules?.[moduleName]?.[subModuleName]?.[permissionType] || false
    );
  };

  const handleCloseModal = () => {
    resetForm();
    setOpen(false);
    setActiveTab("basic");
  };

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * pagination.limit + 1} -{" "}
        {Math.min(currentPage * pagination.limit, pagination.total)} of{" "}
        {pagination.total} users
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
          }
          disabled={currentPage === pagination.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="custom-container ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <HeaderGradient
          title="User Management"
          subtitle="Manage users, roles, and permissions across companies"
        />
        <CheckAccess module="UserManagement" subModule="User" type="create">
          <Button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CheckAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Active Users
                </p>
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Admins</p>
                <p className="text-3xl font-bold">{stats.adminUsers}</p>
              </div>
              <Shield className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Sales</p>
                <p className="text-3xl font-bold">{stats.salesUsers}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Agents</p>
                <p className="text-3xl font-bold">{stats.agentUsers}</p>
              </div>
              <Key className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-teal-500 focus:ring-teal-200 rounded-lg"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-40 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-teal-200"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40 h-10 px-3 py-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-teal-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && <TableViewSkeleton />}

      {/* User List */}
      {pagination.total === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="No users registered yet"
          description="Create your first user to get started"
          buttonLabel="Add Your First User"
          module="UserManagement"
          subModule="User"
          type="create"
          onButtonClick={() => setOpen(true)}
        />
      ) : (
        <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableRow>
                    <TableHead className="text-gray-700 font-semibold">
                      User
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Role
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Sub-Roles
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Companies
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Last Login
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-teal-100 to-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-teal-600 text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.subRole.map((subRole, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {subRole}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.status === "active"}
                            onCheckedChange={() => handleToggleStatus(user.id)}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {user.status?.charAt(0).toUpperCase() +
                              user.status?.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user?.access?.map((access, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                            >
                              {getCompanyName(access.company)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {user.lastLogin !== "Never"
                            ? timeAgo(user.lastLogin)
                            : user.lastLogin}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onEdit={() => handleEditUser(user)}
                          onDelete={() => handleDeleteUser(user._id || "")}
                          module="UserManagement"
                          subModule="User"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <PaginationControls />

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={handleCloseModal}>
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title={isEditing ? "Edit User" : "Add New User"}
            subtitle={
              isEditing
                ? "Update user details, roles, and permissions"
                : "Fill in the user details, roles, and permissions"
            }
          />

          <MultiStepNav
            steps={tabs}
            currentStep={activeTab}
            onStepChange={setActiveTab}
            stepIcons={stepIcons}
          />

          <div className="flex-1 overflow-y-auto px-1">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                {/* <SectionHeader
        icon={<Users className="w-4 h-4 text-white" />}
        title="User Information"
        gradientFrom="from-teal-400"
        gradientTo="to-teal-500"
      />   */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInputBox
                    name="name"
                    label="Name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    required={true}
                  />
                  <CustomInputBox
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g., john.doe@example.com"
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <CustomInputBox
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      isEditing
                        ? "Enter new password (leave blank to keep current)"
                        : "e.g., SecurePass123!"
                    }
                    required={!isEditing}
                  />
                  <CustomInputBox
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g., +91 9876543210"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <CustomInputBox
                    label="Area"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g., Downtown Mumbai"
                  />
                  <CustomInputBox
                    label="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="e.g., 400001"
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Company <span className="text-red-500">*</span></label>
              <select
                name="company"
                value={form.company}
                onChange={(e) => handleSelectChange('company', e.target.value)}
                className="h-10 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus:outline-none bg-white transition-all text-sm"
              >
                <option value="">Select a Company</option>
                {companies.map(company => (
                  <option key={company["_id"]} value={company["_id"]}>{company.namePrint}</option>
                ))}
              </select>
            </div> */}
                  <SelectedCompany />
                </div>

                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={4}
                  showPrevious={false}
                  onNext={() => setActiveTab("role")}
                />
              </div>
            )}

            {/* Role & Sub-Role Tab */}
            {activeTab === "role" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                {/* <SectionHeader
                  icon={<Users className="w-4 h-4 text-white" />}
                  title="Role & Sub-Role"
                  gradientFrom="from-blue-400"
                  gradientTo="to-blue-500"
                /> */}

                {/* Role Selection */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Primary Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {roles.map((role) => (
                      <div
                        key={role}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          form.role === role
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-teal-300"
                        }`}
                        onClick={() => handleSelectChange("role", role)}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${
                              form.role === role
                                ? "bg-teal-500 border-teal-500"
                                : "border-gray-300"
                            }`}
                          >
                            {form.role === role && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-700 text-sm">
                            {role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Role Selection */}
                {/* {form.role && (
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Sub-Roles</label>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {subRoles[form.role as keyof typeof subRoles]?.map((subRole) => (
                    <div key={subRole} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={subRole}
                        checked={form.subRole.includes(subRole)}
                        onChange={(e) => handleSubRoleChange(subRole, e.target.checked)}
                        className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <label htmlFor={subRole} className="text-sm font-medium text-gray-700">
                        {subRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )} */}

                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("basic")}
                  onNext={() => setActiveTab("permissions")}
                  disabledNext={!form.role}
                />
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === "permissions" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                {/* <SectionHeader
                  icon={<Key className="w-4 h-4 text-white" />}
                  title="Company Permissions"
                  gradientFrom="from-purple-400"
                  gradientTo="to-purple-500"
                /> */}

                <div className="space-y-4">
                  {/* Company Access Sections */}
                  {form.access.map((access, companyIndex) => (
                    <Card
                      key={access.company}
                      className="border-teal-200 shadow-sm"
                    >
                      <CardHeader className="bg-teal-50 py-2 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2 text-teal-600" />
                            <CardTitle className="text-base text-teal-800">
                              {getCompanyName(access.company)}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        {Object.entries(availableModules).map(
                          ([moduleKey, moduleValue]) => (
                            <div key={moduleKey} className="mb-4 last:mb-0">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center text-sm">
                                <Lock className="w-3 h-3 mr-2 text-gray-600" />
                                {moduleKey}
                              </h4>
                              <div className="pl-4 space-y-3">
                                {Object.entries(moduleValue).map(
                                  ([subModuleKey, defaultPermissions]) => (
                                    <div
                                      key={subModuleKey}
                                      className="bg-gray-50 p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-700 text-sm">
                                          {subModuleKey}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-500">
                                            All
                                          </span>
                                          <input
                                            type="checkbox"
                                            checked={
                                              getPermissionForCompany(
                                                access.company,
                                                moduleKey,
                                                subModuleKey,
                                                "create"
                                              ) &&
                                              getPermissionForCompany(
                                                access.company,
                                                moduleKey,
                                                subModuleKey,
                                                "read"
                                              ) &&
                                              getPermissionForCompany(
                                                access.company,
                                                moduleKey,
                                                subModuleKey,
                                                "update"
                                              ) &&
                                              getPermissionForCompany(
                                                access.company,
                                                moduleKey,
                                                subModuleKey,
                                                "delete"
                                              )
                                            }
                                            onChange={(e) =>
                                              handleToggleAllPermissions(
                                                access.company,
                                                moduleKey,
                                                subModuleKey,
                                                e.target.checked
                                              )
                                            }
                                            className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
                                          />
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {(
                                          [
                                            "create",
                                            "read",
                                            "update",
                                            "delete",
                                          ] as const
                                        ).map((permissionType) => (
                                          <div
                                            key={permissionType}
                                            className="flex items-center space-x-1"
                                          >
                                            <input
                                              type="checkbox"
                                              id={`${access.company}-${moduleKey}-${subModuleKey}-${permissionType}`}
                                              checked={
                                                getPermissionForCompany(
                                                  access.company,
                                                  moduleKey,
                                                  subModuleKey,
                                                  permissionType
                                                ) as boolean
                                              }
                                              onChange={(e) =>
                                                handlePermissionChange(
                                                  access.company,
                                                  moduleKey,
                                                  subModuleKey,
                                                  permissionType,
                                                  e.target.checked
                                                )
                                              }
                                              className="w-3 h-3 text-teal-600 rounded focus:ring-teal-500"
                                            />
                                            <label
                                              htmlFor={`${access.company}-${moduleKey}-${subModuleKey}-${permissionType}`}
                                              className="text-xs text-gray-600 capitalize"
                                            >
                                              {permissionType}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {form.access.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-base font-semibold">
                          No Company Access Configured
                        </p>
                        <p className="text-gray-400 text-xs mb-3">
                          Add company access to configure permissions
                        </p>
                        <Button
                          onClick={addCompanyAccess}
                          variant="outline"
                          className="flex items-center border-gray-300 hover:bg-gray-100 text-sm py-1"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Company Access
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("role")}
                  onNext={() => setActiveTab("settings")}
                />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                {/* <SectionHeader
                  icon={<Settings2 className="w-4 h-4 text-white" />}
                  title="User & Permission Summary"
                  gradientFrom="from-blue-400"
                  gradientTo="to-blue-500"
                /> */}

                {/* User Summary */}
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-200 mb-4">
                  <h4 className="text-sm font-semibold text-teal-700 mb-2">
                    User Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        <strong>Name:</strong> {form.name || "Not specified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Email:</strong> {form.email || "Not specified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Role:</strong> {form.role || "Not selected"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Sub-Roles:</strong>{" "}
                        {form.subRole.join(", ") || "None"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600">
                        <strong>Phone:</strong> {form.phone || "Not specified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Location:</strong>{" "}
                        {form.area && form.pincode
                          ? `${form.area}, ${form.pincode}`
                          : "Not specified"}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Company Access:</strong> {form.access.length}{" "}
                        companies
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permission Summary */}
                {form.access.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2">
                      Permission Summary
                    </h4>
                    {form.access.map((access) => (
                      <div key={access.company} className="mb-2 last:mb-0">
                        <p className="font-medium text-blue-800 text-sm">
                          {getCompanyName(access.company)}
                        </p>
                        <div className="text-xs text-blue-600 ml-3">
                          {Object.entries(access.modules).map(
                            ([moduleName, modulePermissions]) => (
                              <div key={moduleName}>
                                <strong>{moduleName}:</strong>{" "}
                                {Object.keys(modulePermissions).join(", ")}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("permissions")}
                  onSubmit={handleSubmit}
                  submitLabel={isEditing ? "Update User" : "Create User"}
                  isLastStep={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
