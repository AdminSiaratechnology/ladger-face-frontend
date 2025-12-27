import React, { useState, useMemo, useEffect, useRef } from "react";
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
  ChevronDown,
  Warehouse, // Added Warehouse icon
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
import { ScrollArea } from "@radix-ui/react-scroll-area";
import UniversalUserDetailsModal from "../customComponents/UniversalUserDetailsModal";
import { useCustomerGroupStore } from "../../../store/CustomerGroupStore";

import axios from "axios";

// --- Interfaces ---

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
  customerGroups: CustomerGroup[];
  godowns: Godown[]; // Added Godowns to Access
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
  clientID: string;
  company?: string;
  access: Access[];
  phone?: string;
  area?: string;
  pincode?: string;
  status?: "active" | "inactive";
  lastLogin?: string | null;
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
  clientID: string;
  company?: string;
  access: Access[];
  phone: string;
  area: string;
  pincode: string;
  status: string;
  blocked: boolean;
}

interface CustomerGroup {
  groupId: string;
  groupName: string;
  groupCode: string;
}

// Added Godown Interface
interface Godown {
  _id: string;
  company: string;
  client: string;
  code: string;
  name: string;
  country: string;
  isPrimary: boolean;
  status: string;
  contactNumber?: string;
  manager?: string;
  capacity?: string;
  address?: string;
  state?: string;
  city?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Step Icons for MultiStepNav
const stepIcons = {
  basic: <Users className="w-2 h-2 md:w-5 md:h-5" />,
  role: <Shield className="w-2 h-2 md:w-5 md:h-5" />,
  permissions: <Key className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

// --- CUSTOM STORE FOR GODOWNS (Local Implementation) ---

import { useGodownStore } from "../../../store/godownStore";
import { availableModules } from "@/lib/availableModules";
import LimitExceedModal from "../customComponents/LimitExceedModal";
import { useAuthStore } from "../../../store/authStore";

interface GodownStore {
  godowns: Godown[];
  loading: boolean;
  fetchGodowns: (companyId: string) => Promise<void>;
}

const CustomerGroupSelector: React.FC<{
  companyId: string;
  selectedGroupIds: string[];
  onChange: (groupIds: string[]) => void;
}> = ({ companyId, selectedGroupIds, onChange }) => {
  const { groups, fetchGroups, loading } = useCustomerGroupStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (companyId) {
      fetchGroups(companyId);
    }
  }, [companyId, fetchGroups]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const companyGroups = groups.filter((g) => g.companyId === companyId);
  const selectedGroupsData = companyGroups.filter((g) =>
    selectedGroupIds.includes(g._id)
  );

  const availableGroups = companyGroups.filter(
    (g) =>
      !selectedGroupIds.includes(g._id) &&
      g.status === "active" &&
      g.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addGroup = (groupId: string) => {
    onChange([...selectedGroupIds, groupId]);
    setSearchTerm("");
  };

  const removeGroup = (groupId: string) => {
    onChange(selectedGroupIds.filter((id) => id !== groupId));
  };

  if (loading) return <p className="text-sm text-gray-500 py-2">Loading...</p>;

  if (companyGroups.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-sm text-gray-500">No customer groups found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search and add customer groups..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
            {availableGroups.length > 0 ? (
              availableGroups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => addGroup(group._id)}
                  className="flex flex-col px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {group.groupName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Code: {group.groupCode}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                {searchTerm
                  ? "No matching groups found"
                  : "All groups selected"}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGroupsData.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium self-center mr-1">
            Selected:
          </span>
          {selectedGroupsData.map((group) => (
            <div
              key={group._id}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-200"
            >
              {group.groupName}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeGroup(group._id);
                }}
                className="ml-1 hover:text-blue-900 rounded-full hover:bg-blue-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. GodownSelector (NEW)
const GodownSelector: React.FC<{
  companyId: string;
  selectedGodownIds: string[];
  onChange: (godownIds: string[]) => void;
}> = ({ companyId, selectedGodownIds, onChange }) => {
  const { godowns, fetchGodowns, loading, filterGodowns } = useGodownStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (companyId) {
      // createdAt&sortOrder=desc
      // searchTerm,
      //   statusFilter,
      //   sortBy,
      //   page = 1,
      //   limit = 10,
      //   companyId
      //     searchTerm: string,
      // statusFilter: "all" | "active" | "inactive" | "maintenance",
      // sortBy: "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc",
      // companyId?: number | string,
      // page?: number,
      // limit?: number
      filterGodowns(searchTerm, "all", "nameAsc", 1, 10, companyId);
    }
  }, [companyId, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const companyGodowns = godowns.filter((g) => g.company === companyId);

  const selectedGodownsData = companyGodowns.filter((g) =>
    selectedGodownIds.includes(g._id)
  );

  const availableGodowns = companyGodowns.filter(
    (g) =>
      !selectedGodownIds.includes(g._id) &&
      g.status === "active" &&
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addGodown = (godownId: string) => {
    onChange([...selectedGodownIds, godownId]);
    setSearchTerm("");
  };

  const removeGodown = (godownId: string) => {
    onChange(selectedGodownIds.filter((id) => id !== godownId));
  };

  if (loading)
    return <p className="text-sm text-gray-500 py-2">Loading godowns...</p>;

  if (companyGodowns.length === 0) {
    return (
      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Warehouse className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          No godowns found in this company.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search and add godowns..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
            {availableGodowns.length > 0 ? (
              availableGodowns.map((godown) => (
                <div
                  key={godown._id}
                  onClick={() => addGodown(godown._id)}
                  className="flex flex-col px-4 py-2 hover:bg-orange-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {godown.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    Code: {godown.code} | City: {godown.city || "N/A"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                {searchTerm
                  ? "No matching godowns found"
                  : "All godowns selected"}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedGodownsData.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-xs text-gray-500 font-medium self-center mr-1">
            Selected:
          </span>
          {selectedGodownsData.map((godown) => (
            <div
              key={godown._id}
              className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs font-medium border border-orange-200"
            >
              <Warehouse className="w-3 h-3 mr-1 opacity-70" />
              {godown.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeGodown(godown._id);
                }}
                className="ml-1 hover:text-orange-900 rounded-full hover:bg-orange-200 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

const UserManagement: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCompanyData, setSelectedCompanyData] = useState<Company[]>([]);
  const permissionTemplates = {
    fullAccess: { create: true, read: true, update: true, delete: true },
    readOnly: { create: false, read: true, update: false, delete: false },
    alterOnly: { create: false, read: true, update: true, delete: false },
    noDelete: { create: true, read: true, update: true, delete: false },
  };
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [activeCompanyTab, setActiveCompanyTab] = useState<string | null>(null);

  // State for IDs
  const [selectedGroupIds, setSelectedGroupIds] = useState<
    Record<string, string[]>
  >({});
  const [selectedGodownIds, setSelectedGodownIds] = useState<
    Record<string, string[]>
  >({}); // New State

  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const { user, refreshUser } = useAuthStore();
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const limit = 10;
  const [selectedTemplates, setSelectedTemplates] = useState<{
    [companyId: string]: string;
  }>({});

  const { defaultSelected, companies, filterCompanies } = useCompanyStore();
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
    initialLoading,
    counts,
  } = useUserManagementStore();

  const { groups: customerGroups, fetchGroups: fetchCustomerGroups } =
    useCustomerGroupStore();
  const { godowns: companyGodowns, fetchGodowns } = useGodownStore(); // Use new store

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        filterUsers(
          searchTerm,
          roleFilter,
          statusFilter,
          "nameAsc",
          currentPage,
          limit,
          defaultSelected?._id
        )
          .then((result) => {
            setFilteredUsers(result);
          })
          .catch((err) => {
            console.error("Error filtering users:", err);
            toast.error("Failed to filter users");
          });
      } else if (searchTerm.length === 0) {
        filterUsers(
          "",
          roleFilter,
          statusFilter,
          "dateDesc",
          currentPage,
          limit,
          defaultSelected?._id
        );
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
    currentPage,
    filterUsers,
    defaultSelected,
  ]);

  // Roles and Sub-roles
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

  // Available modules
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

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "",
    subRole: [],
    allPermissions: false,
    parent: "",
    createdBy: "",
    clientID: "",
    company: "",
    access: [],
    phone: "",
    area: "",
    status: "active",
    pincode: "",
    blocked: false,
  });

  useEffect(() => {
    if (defaultSelected) {
      setForm((prev) => ({ ...prev, company: defaultSelected?._id }));
    }
  }, [defaultSelected, companies]);

  useEffect(() => {
    setForm((prev) => {
      // Create access entries for selected companies that don't exist yet
      const newAccess = [...prev.access];

      selectedCompanies.forEach((companyId) => {
        const exists = newAccess.find((a) => a.company === companyId);
        if (!exists) {
          newAccess.push({
            company: companyId,
            modules: {},
          });
        }
      });

      // Remove access entries for unselected companies
      const filteredAccess = newAccess.filter((a) =>
        selectedCompanies.includes(a.company)
      );

      return { ...prev, access: filteredAccess };
    });
  }, [selectedCompanies]);
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

  // Reset form function
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "",
      subRole: [],
      allPermissions: false,
      status: "",
      parent: "",
      createdBy: "",
      clientID: "",
      company: "",
      access: companies.map((company) => ({
        company: company._id,
        modules: {},
        customerGroups: [],
        godowns: [],
      })),
      phone: "",
      area: "",
      pincode: "",
      blocked: false,
    });
    setEditingUser(null);
    setIsEditing(false);
    setSelectedGroupIds({});
    setSelectedGodownIds({}); // Reset godown IDs
  };

  // Load customer groups and godowns when company is selected
  useEffect(() => {
    if (activeCompanyTab) {
      fetchCustomerGroups(activeCompanyTab);
      let companyId = activeCompanyTab;
      fetchGodowns(1, 10, companyId); // Fetch Godowns
    }
  }, [activeCompanyTab, fetchCustomerGroups, fetchGodowns]);

  // Update form when selected groups/godowns change
  // FIX: Added JSON stringify check to prevent infinite loop on array reference changes
  useEffect(() => {
    if (activeCompanyTab) {
      const currentGroups = selectedGroupIds[activeCompanyTab] || [];
      const currentGodowns = selectedGodownIds[activeCompanyTab] || [];

      setForm((prev) => {
        // Create new state
        const updatedAccess = prev.access.map((a) => {
          if (a.company !== activeCompanyTab) return a;

          // Map selected IDs to objects
          const newGroups = currentGroups
            .map((id) => {
              const group = customerGroups.find((g) => g._id === id);
              return group
                ? {
                    groupId: group._id,
                    groupName: group.groupName,
                    groupCode: group.groupCode,
                  }
                : null;
            })
            .filter(Boolean) as CustomerGroup[];

          const newGodowns = currentGodowns
            .map((id) => {
              return companyGodowns.find((g) => g._id === id) || null;
            })
            .filter(Boolean) as Godown[];

          return {
            ...a,
            customerGroups: newGroups,
            godowns: newGodowns,
          };
        });

        // Simple check to avoid unnecessary updates if nothing changed
        if (JSON.stringify(updatedAccess) === JSON.stringify(prev.access)) {
          return prev;
        }

        return {
          ...prev,
          access: updatedAccess,
        };
      });
    }
  }, [
    selectedGroupIds,
    selectedGodownIds,
    activeCompanyTab,
    customerGroups,
    companyGodowns,
  ]);

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

  const handleSubmit = async (): Promise<void> => {
    // --- Validation ---
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
    if (!isEditing && !form.password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    if (form.role === "Customer" && form.access.length === 0) {
      toast.error(
        "Please select at least one company from permissions under which you want to register this user as customer"
      );
      return;
    }

    // --- Prepare data ---
    const userData: User = {
      ...form,
      id: editingUser?._id || Date.now().toString(),
      status: form?.status || "active",
      lastLogin: editingUser?.lastLogin || null,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
      createdBy: form.createdBy || "current_user_id", // Replace with actual user ID
      parent: form.parent || "",
      clientID: form.clientID || "",
      company: form.company || "",
      blocked: form.blocked ?? false,
    };
    try {
      let res;
      if (isEditing && editingUser) {
        res = await editUser(editingUser._id || "", userData);
      } else {
        res = await addUser(userData);
      }

      if (res && res?.statusCode) {
        filterUsers(
          "",
          roleFilter,
          statusFilter,
          "dateDesc",
          currentPage,
          limit,
          defaultSelected?._id
        );
        toast.success(
          isEditing ? "User updated successfully" : "User added successfully"
        );
        resetForm();
        setOpen(false);
        setActiveTab("basic");
      }
      refreshUser();
    } catch (error) {
      console.error("Error submitting user:", error);
      toast.error("Failed to save user. Please try again.");
    }
  };

  const handleEditUser = (user: User) => {
    if (user.role == "Client") {
      toast.error(
        "Access denied: Only Administrators can modify client details."
      );
      return;
    }

    setEditingUser(user);
    setIsEditing(true);

    // ✅ Preselected company IDs
    const preselectedCompanies = user.access.map(
      (a) => a.company._id || a.company
    );

    // ✅ Build merged access (already includes company + modules)
    const mergedAccess = user.access.map((a) => ({
      company: a.company._id || a.company,
      modules: a.modules || {},
      customerGroups: a.customerGroups || [],
      godowns: a.godowns || [],
    }));
    // ✅ Build selectedCompanyData directly from user.access (already has namePrint)
    const selectedCompanyData = user.access.map((a) => ({
      _id: a.company._id || a.company,
      namePrint: a.company.namePrint || "Unnamed Company",
    }));

    // ✅ Extract selected group IDs for each company
    const initialGroupIds: Record<string, string[]> = {};
    const initialGodownIds: Record<string, string[]> = {};

    user.access.forEach((a) => {
      const companyId = a.company._id || a.company;
      initialGroupIds[companyId] =
        a.customerGroups?.map((g) => g.groupId) || [];
      initialGodownIds[companyId] = a.godowns?.map((g) => g._id) || [];
    });

    // ✅ Set form data
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      subRole: user.subRole,
      allPermissions: user.allPermissions,
      parent: user.parent,
      clientID: user.clientID,
      company: user.company || "",
      access: mergedAccess,
      phone: user.phone || "",
      area: user.area || "",
      pincode: user.pincode || "",
      status: user.status || "active",
      blocked: user.blocked || false,
    });

    // ✅ Update company selections for permission tab
    setSelectedCompanies(preselectedCompanies);
    setSelectedCompanyData(selectedCompanyData);
    setSelectedGroupIds(initialGroupIds);
    setSelectedGodownIds(initialGodownIds); // Set Godown IDs
    setActiveCompanyTab(preselectedCompanies[0] || "");

    // ✅ Open modal and go to Basic tab
    setOpen(true);
    setActiveTab("basic");
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === "Client") {
      toast.error(
        "Access denied: Only Administrators can delete client users."
      );
      return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(user._id || "");
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
      totalUsers: pagination?.total,
      activeUsers: counts?.activeUsers,
      adminUsers: counts?.adminCount,
      salesUsers: counts?.salesmanCount,
      customerUsers: counts?.customerCount,
    }),
    [filteredUsers, pagination, statusFilter, roleFilter]
  );

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
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
    const access = form.access.find((a) => {
      return a.company === companyId;
    });
    return (
      access?.modules?.[moduleName]?.[subModuleName]?.[permissionType] || false
    );
  };

  useEffect(() => {
    if (searchTerm2.length >= 3) {
      filterCompanies(searchTerm2, "active", "dateAsc");
    } else if (companies.length > 10) {
      filterCompanies(searchTerm2, "active", "dateAsc");
    }
  }, [searchTerm2]);

  // ✅ Handle toggle for selecting/unselecting companies
  const toggleCompanySelection = (companyId: string) => {
    const existing = selectedCompanies.includes(companyId);
    const company = companies.find((c) => c._id === companyId);

    setSelectedCompanies((prev) => {
      const updated = existing
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId];

      // 🧭 Handle active tab switching
      if (existing) {
        // If removed and it was the active tab, set a new active tab or clear
        if (activeCompanyTab === companyId) {
          setActiveCompanyTab(updated[0] || null);
        }
      } else {
        // If newly added, make it the active company tab
        setActiveCompanyTab(companyId);
      }

      return updated;
    });

    setSelectedCompanyData((prev) => {
      if (existing) {
        return prev.filter((c) => c._id !== companyId);
      } else if (company) {
        return [...prev, company];
      }
      return prev;
    });

    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".company-dropdown-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseModal = () => {
    setSelectedCompanies([]);
    setSelectedCompanyData([]);
    setSelectedTemplates({});
    setSelectedGroupIds({});
    setSelectedGodownIds({});
    resetForm();
    setOpen(false);
    setActiveTab("basic");
  };

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * pagination?.limit + 1} -{" "}
        {Math.min(currentPage * pagination?.limit, pagination?.total)} of{" "}
        {pagination?.total} users
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
          Page {currentPage} of {pagination?.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(pagination?.totalPages, prev + 1))
          }
          disabled={currentPage === pagination?.totalPages}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      initialLoading();
    };
  }, []);

  return (
    <div className="custom-container ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <HeaderGradient
          title="User Management"
          subtitle="Manage users, roles, and permissions across companies"
        />

        <div className="flex items-center gap-4">
          {user?.clientLimit !== undefined && (
            <div className="flex items-center gap-2 px-4 py-1 rounded-xl bg-linear-to-r from-blue-100 to-teal-50 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">
                  Client Limit:
                </span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-blue-100">
                  <span className="text-base font-bold text-blue-700">
                    {user?.clientLimit}
                  </span>
                  <span className="text-xs text-gray-500 ml-0.5">users</span>
                </div>
              </div>
            </div>
          )}

          <CheckAccess module="UserManagement" subModule="User" type="create">
            <Button
              onClick={() => {
                if (user?.clientLimit === 0) {
                  setShowLimitModal(true);
                  return;
                }
                setOpen(true);
                if (defaultSelected && companies.length > 0) {
                  setForm((prev) => ({
                    ...prev,
                    company: defaultSelected?._id,
                  }));
                }
              }}
              className="w-full cursor-pointer sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </CheckAccess>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Active Users
                </p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <UserCheck className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold">{stats.adminUsers}</p>
              </div>
              <Shield className="w-6 h-6 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Sales</p>
                <p className="text-2xl font-bold">{stats.salesUsers}</p>
              </div>
              <Building2 className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Customers</p>
                <p className="text-2xl font-bold">{stats.customerUsers}</p>
              </div>
              <Key className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden mb-3">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center md:space-y-0 md:space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-teal-500 focus:ring-teal-200 rounded-lg"
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-40 h-10 px-3  border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-teal-200"
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
              className="w-full md:w-40 h-10 px-3 py-1 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-teal-200"
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
      {pagination?.total === 0 ? (
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
                        <div className="flex items-center space-x-2">
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
                        {user.role === "Client" ? (
                          <div className="flex flex-wrap gap-1">
                            {/* Full access badge for Client */}
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              All Companies
                            </span>
                          </div>
                        ) : user.access && user.access.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.access.map((a, index) => {
                              const company =
                                typeof a.company === "object"
                                  ? a.company
                                  : {
                                      _id: a.company,
                                      namePrint: `Unknown (${a.company.slice(
                                        -4
                                      )})`,
                                    };

                              return (
                                <span
                                  key={company._id + index}
                                  className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {company.namePrint}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No Access
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {!user.lastLogin || user.lastLogin === "Never"
                            ? "Never"
                            : timeAgo(user.lastLogin)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionsDropdown
                          onView={() => handleViewUser(user)}
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
            onStepChange={(nextTab) => {
              const stepOrder = ["basic", "permissions", "settings"];
              const currentIndex = stepOrder.indexOf(activeTab);
              const nextIndex = stepOrder.indexOf(nextTab);

              if (nextIndex < currentIndex) {
                setActiveTab(nextTab);
                return;
              }

              if (activeTab === "basic") {
                if (
                  !form.name ||
                  !form.email ||
                  (!isEditing && !form.password) ||
                  !form.role
                ) {
                  toast.error(
                    "Please fill in all required fields: Name, Email, Password, and Role."
                  );
                  return;
                }
              }

              setActiveTab(nextTab);
            }}
            stepIcons={stepIcons}
            scrollContainerRef={containerRef}
          />

          <div className="flex-1 overflow-y-auto px-1" ref={containerRef}>
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
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
                  />
                </div>
                <div className="flex flex-col w-1/2 gap-1 mt-4">
                  <label className="text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) => {
                      handleSelectChange("status", e.target.value);
                    }}
                    className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>

                  {editingUser?.blocked && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                      <input
                        type="checkbox"
                        checked={form.blocked === false}
                        onChange={(e) => {
                          handleSelectChange("blocked", !e.target.checked);
                        }}
                        className="cursor-pointer"
                      />
                      Unblock this user
                    </label>
                  )}
                </div>

                {/* Role Selection */}
                <div className="mb-4 mt-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Primary Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {roles.map((role) => (
                      <div
                        key={role}
                        onClick={() => {
                          // Prevent selecting Customer if no companies exist
                          if (role === "Customer" && companies.length === 0)
                            return;
                          handleSelectChange("role", role);
                        }}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          form.role === role
                            ? "border-teal-500 bg-teal-50"
                            : role === "Customer" && companies.length === 0
                            ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                            : "border-gray-200 hover:border-teal-300 cursor-pointer"
                        }`}
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
                  {companies.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                      Customer role is disabled now beacuse you have not
                      registered any company yet.*
                    </p>
                  )}
                </div>

                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={3}
                  showPrevious={false}
                  onNext={() => {
                    if (
                      !form.name ||
                      !form.email ||
                      (!isEditing && !form.password) ||
                      !form.role
                    ) {
                      toast.error(
                        "Please fill in all required fields: Name, Email, Password, and Role."
                      );
                      return;
                    }
                    setActiveTab("permissions");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {/* Permissions Tab */}
            {activeTab === "permissions" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="relative company-dropdown-container">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search company..."
                      className="pl-9"
                      value={searchTerm2}
                      onChange={(e) => setSearchTerm2(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                    />
                  </div>

                  {selectedCompanies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 font-medium mr-2 self-center">
                        Selected:
                      </span>
                      {selectedCompanyData.map((company) => (
                        <div
                          key={company._id}
                          className="flex items-center gap-1 bg-gray-300 text-teal-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {company.namePrint}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompanySelection(company._id);
                            }}
                            className="ml-0.5 hover:text-teal-900"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-scroll">
                      <ScrollArea className="max-h-[300px] p-2">
                        {loading ? (
                          <p className="text-center text-gray-500 text-sm mt-4">
                            Loading companies...
                          </p>
                        ) : companies.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {companies
                              .filter(
                                (company) =>
                                  !selectedCompanies.includes(company._id)
                              )
                              .map((company) => {
                                return (
                                  <div
                                    key={company._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCompanySelection(company._id);
                                    }}
                                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                  >
                                    <div className="flex flex-col">
                                      <p className="text-sm font-semibold text-gray-800">
                                        {company.namePrint}
                                      </p>
                                      {company.nameStreet && (
                                        <p className="text-xs text-gray-500">
                                          {company.nameStreet}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 text-sm mt-4">
                            No companies found.
                          </p>
                        )}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {selectedCompanyData.length === 0 ? (
                  <EmptyStateCard
                    title="No company selected"
                    description="Please select a company to assign permissions."
                    icon={Building2}
                  />
                ) : (
                  <div className="mt-1 shadow-sm p-2">
                    <nav className="bg-gradient-to-r from-gray-50 to-white rounded-lg mb-4 shadow-sm">
                      <div className="flex space-x-1 overflow-x-auto">
                        {selectedCompanyData.map((company) => {
                          const isActive = activeCompanyTab === company._id;
                          return (
                            <button
                              key={company._id}
                              onClick={() => setActiveCompanyTab(company._id)}
                              className={`
            relative flex items-center gap-2 px-2 whitespace-nowrap py-3 text-sm font-medium transition-all duration-300
            border-b-2
            ${
              isActive
                ? "border-teal-500 text-teal-700 bg-gradient-to-b from-white to-teal-50 shadow-sm"
                : "border-transparent text-gray-500 hover:text-teal-600 hover:border-teal-200"
            }
          `}
                            >
                              <div
                                className={`flex items-center justify-center rounded transition-colors
              ${isActive ? "bg-teal-100 text-teal-600" : "text-gray-400"}
            `}
                              >
                                <Building2 className="w-3.5 h-3.5" />
                              </div>

                              <span className="font-semibold">
                                {company.namePrint}
                              </span>

                              {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-teal-500 rounded-full"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </nav>

                    {activeCompanyTab && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-teal-700">
                            Quick Permission Templates:
                          </label>
                          <select
                            className="border border-teal-300 rounded-lg p-2 text-sm"
                            value={selectedTemplates[activeCompanyTab] || ""}
                            onChange={(e) => {
                              const templateName = e.target.value;
                              setSelectedTemplates((prev) => ({
                                ...prev,
                                [activeCompanyTab]: templateName,
                              }));

                              const selectedTemplate =
                                permissionTemplates[
                                  templateName as keyof typeof permissionTemplates
                                ];
                              if (selectedTemplate) {
                                Object.entries(availableModules).forEach(
                                  ([moduleKey, subModules]) => {
                                    Object.keys(subModules).forEach(
                                      (subKey) => {
                                        handleToggleAllPermissions(
                                          activeCompanyTab,
                                          moduleKey,
                                          subKey,
                                          false
                                        );
                                        Object.entries(
                                          selectedTemplate
                                        ).forEach(([permType, value]) => {
                                          handlePermissionChange(
                                            activeCompanyTab,
                                            moduleKey,
                                            subKey,
                                            permType as keyof Permission,
                                            value
                                          );
                                        });
                                      }
                                    );
                                  }
                                );
                                toast.success(
                                  `Applied ${templateName} template to ${getCompanyName(
                                    activeCompanyTab
                                  )}`
                                );
                              }
                            }}
                          >
                            <option value="">Select Template</option>
                            <option value="fullAccess">Full Access</option>
                            <option value="readOnly">Read Only</option>
                            <option value="alterOnly">Alter Only</option>
                            <option value="noDelete">
                              Full Access except Delete
                            </option>
                          </select>
                        </div>

                        {/* Customer Groups Section */}
                        <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-blue-700">
                              Customer Groups Access
                            </h3>
                          </div>

                          <div className="space-y-2">
                            <CustomerGroupSelector
                              companyId={activeCompanyTab}
                              selectedGroupIds={
                                selectedGroupIds[activeCompanyTab] || []
                              }
                              onChange={(groupIds) => {
                                setSelectedGroupIds((prev) => ({
                                  ...prev,
                                  [activeCompanyTab]: groupIds,
                                }));
                              }}
                            />
                          </div>

                          {(selectedGroupIds[activeCompanyTab] || []).length >
                            0 && (
                            <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                              <p className="text-sm text-blue-700">
                                <strong>Note:</strong> User will have access
                                only to customers in the selected groups.
                                {(selectedGroupIds[activeCompanyTab] || [])
                                  .length === 0
                                  ? " Leave empty for all groups access."
                                  : ""}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Godown Access Section (NEW) */}
                        <div className="bg-white p-4 rounded-lg border border-orange-200 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-orange-700">
                              Godown Access
                            </h3>
                          </div>

                          <div className="space-y-2">
                            <GodownSelector
                              companyId={activeCompanyTab}
                              selectedGodownIds={
                                selectedGodownIds[activeCompanyTab] || []
                              }
                              onChange={(godownIds) => {
                                setSelectedGodownIds((prev) => ({
                                  ...prev,
                                  [activeCompanyTab]: godownIds,
                                }));
                              }}
                            />
                          </div>

                          {(selectedGodownIds[activeCompanyTab] || []).length >
                            0 && (
                            <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                              <p className="text-sm text-orange-700">
                                <strong>Note:</strong> User will have access
                                only to selected godowns.
                                {(selectedGodownIds[activeCompanyTab] || [])
                                  .length === 0
                                  ? " Leave empty for all godown access."
                                  : ""}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          {Object.entries(availableModules).map(
                            ([moduleKey, subModules]) => {
                              const allChecked = Object.entries(
                                subModules
                              ).every(([subModuleKey]) => {
                                const perms = [
                                  "create",
                                  "read",
                                  "update",
                                  "delete",
                                ];
                                return perms.every((permType) =>
                                  getPermissionForCompany(
                                    activeCompanyTab,
                                    moduleKey,
                                    subModuleKey,
                                    permType
                                  )
                                );
                              });

                              return (
                                <div
                                  key={moduleKey}
                                  className="border-b border-gray-200 last:border-b-0"
                                >
                                  <button
                                    onClick={() => {
                                      setOpenModules((prev) => ({
                                        ...prev,
                                        [moduleKey]: !prev[moduleKey],
                                      }));
                                    }}
                                    className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="flex flex-col items-start">
                                        <h4 className="font-bold text-gray-800 text-lg">
                                          {moduleKey}
                                        </h4>
                                        <span className="text-xs bg-gray-100 text-gray-600 rounded-full mt-1">
                                          {Object.entries(subModules).reduce(
                                            (acc, [subModuleKey]) => {
                                              const perms = [
                                                "create",
                                                "read",
                                                "update",
                                                "delete",
                                              ];
                                              const count = perms.filter(
                                                (permType) =>
                                                  getPermissionForCompany(
                                                    activeCompanyTab,
                                                    moduleKey,
                                                    subModuleKey,
                                                    permType
                                                  )
                                              ).length;
                                              return acc + count;
                                            },
                                            0
                                          )}{" "}
                                          selected out of{" "}
                                          {Object.keys(subModules).length * 4}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <label
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={allChecked}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            Object.entries(subModules).forEach(
                                              ([subModuleKey]) => {
                                                [
                                                  "create",
                                                  "read",
                                                  "update",
                                                  "delete",
                                                ].forEach((permType) => {
                                                  handlePermissionChange(
                                                    activeCompanyTab,
                                                    moduleKey,
                                                    subModuleKey,
                                                    permType,
                                                    checked
                                                  );
                                                });
                                              }
                                            );
                                          }}
                                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="font-medium">All</span>
                                      </label>

                                      <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                          openModules[moduleKey]
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </div>
                                  </button>

                                  <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                      openModules[moduleKey]
                                        ? "max-h-[1000px] opacity-100"
                                        : "max-h-0 opacity-0"
                                    }`}
                                  >
                                    <div className="pb-3 px-2 space-y-1">
                                      {Object.entries(subModules).map(
                                        ([subModuleKey]) => {
                                          const allSubChecked = [
                                            "create",
                                            "read",
                                            "update",
                                            "delete",
                                          ].every((permType) =>
                                            getPermissionForCompany(
                                              activeCompanyTab,
                                              moduleKey,
                                              subModuleKey,
                                              permType
                                            )
                                          );
                                          return (
                                            <div
                                              key={subModuleKey}
                                              className="flex flex-col bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                                            >
                                              <div className="flex items-center justify-between w-full ">
                                                <div className="flex-1">
                                                  <span className="text-sm font-semibold text-gray-700">
                                                    {subModuleKey}
                                                  </span>
                                                </div>
                                                {openModules[moduleKey] && (
                                                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                    <input
                                                      type="checkbox"
                                                      checked={allSubChecked}
                                                      onChange={(e) => {
                                                        const checked =
                                                          e.target.checked;
                                                        [
                                                          "create",
                                                          "read",
                                                          "update",
                                                          "delete",
                                                        ].forEach(
                                                          (permType) => {
                                                            handlePermissionChange(
                                                              activeCompanyTab,
                                                              moduleKey,
                                                              subModuleKey,
                                                              permType,
                                                              checked
                                                            );
                                                          }
                                                        );
                                                      }}
                                                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                    />
                                                    <span className="font-medium">
                                                      All
                                                    </span>
                                                  </label>
                                                )}
                                              </div>
                                              {openModules[moduleKey] && (
                                                <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                                                  {(
                                                    [
                                                      "create",
                                                      "read",
                                                      "update",
                                                      "delete",
                                                    ] as const
                                                  ).map((permType) => (
                                                    <label
                                                      key={permType}
                                                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={getPermissionForCompany(
                                                          activeCompanyTab,
                                                          moduleKey,
                                                          subModuleKey,
                                                          permType
                                                        )}
                                                        onChange={(e) =>
                                                          handlePermissionChange(
                                                            activeCompanyTab,
                                                            moduleKey,
                                                            subModuleKey,
                                                            permType,
                                                            e.target.checked
                                                          )
                                                        }
                                                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                      />
                                                      <span className="font-medium">
                                                        {permType
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                          permType.slice(1)}
                                                      </span>
                                                    </label>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end items-end mt-6 border-t pt-4 border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to reset all permissions? This action cannot be undone."
                        )
                      ) {
                        selectedCompanyData.forEach((company) => {
                          Object.entries(availableModules).forEach(
                            ([moduleKey, subModules]) => {
                              Object.keys(subModules).forEach((subKey) => {
                                handleToggleAllPermissions(
                                  company._id,
                                  moduleKey,
                                  subKey,
                                  false
                                );
                              });
                            }
                          );
                        });
                        toast.success("All permissions have been reset");
                      }
                    }}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 cursor-pointer"
                  >
                    Reset Permissions
                  </Button>
                </div>

                {/* Step Navigation */}
                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={3}
                  onPrevious={() => setActiveTab("basic")}
                  onNext={() => setActiveTab("settings")}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
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
                          {access.customerGroups &&
                            access.customerGroups.length > 0 && (
                              <div>
                                <strong>Customer Groups:</strong>{" "}
                                {access.customerGroups
                                  .map((g) => g.groupName)
                                  .join(", ")}
                              </div>
                            )}
                          {access.godowns && access.godowns.length > 0 && (
                            <div>
                              <strong>Godowns:</strong>{" "}
                              {access.godowns.map((g) => g.name).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={3}
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
      <UniversalUserDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedUser}
      />
      <LimitExceedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
};

export default UserManagement;
