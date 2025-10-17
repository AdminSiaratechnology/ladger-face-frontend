import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  MapPin,
  Warehouse,
  Users,
  Building2,
  FileText,
  Star,
  Phone,
  Settings2,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import CustomInputBox from "../customComponents/CustomInputBox";
import { useGodownStore } from "../../../store/godownStore";
import { useCompanyStore } from "../../../store/companyStore";
import FilterBar from "../customComponents/FilterBar";
import HeaderGradient from "../customComponents/HeaderGradint";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import MultiStepNav from "../customComponents/MultiStepNav";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import { CheckAccess } from "../customComponents/CheckAccess";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import SectionHeader from "../customComponents/SectionHeader";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import EmptyStateCard from "../customComponents/EmptyStateCard";

// Godown interface
interface Godown {
  id: number;
  _id?: string;
  code: string;
  name: string;
  parent: string;
  address: string;
  state: string;
  city: string;
  country: string;
  isPrimary: boolean;
  status: "active" | "inactive" | "maintenance";
  capacity: string;
  manager: string;
  contactNumber: string;
  createdAt: string;
  company: string;
}

const stepIcons = {
  basic: <Warehouse className="w-2 h-2 md:w-5 md:h-5" />,
  location: <MapPin className="w-2 h-2 md:w-5 md:h-5" />,
  management: <Users className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

const GodownRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "maintenance"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("nameAsc");
  const [filteredGodowns, setFilteredGodowns] = useState<Godown[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page

  const {
    godowns,
    pagination,
    loading,
    fetchGodowns,
    addGodown,
    updateGodown,
    deleteGodown,
    filterGodowns,
  } = useGodownStore();
  const { companies, defaultSelected } = useCompanyStore();

  // Initial fetch
  useEffect(() => {
    fetchGodowns(currentPage, limit);
  }, [fetchGodowns, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterGodowns(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredGodowns(result);
        })
        .catch((err) => {
          console.error("Error filtering godowns:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterGodowns]);

  const [formData, setFormData] = useState<Godown>({
    id: 0,
    code: "",
    name: "",
    parent: "primary",
    address: "",
    state: "",
    city: "",
    country: "India",
    isPrimary: false,
    status: "active",
    capacity: "",
    company: "",
    manager: "",
    contactNumber: "",
    createdAt: "",
  });
  useEffect(() => {
    if (defaultSelected && companies.length > 0) {
      const selectedCompany = companies.find((c) => c._id === defaultSelected);
      if (selectedCompany) {
        setFormData((prev) => ({ ...prev, company: selectedCompany._id }));
      }
    }
  }, [defaultSelected, companies]);
  // Get all countries
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Get states for selected country
  const availableStates = useMemo(() => {
    const selectedCountry = allCountries.find(
      (c) => c.name === formData.country
    );
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [formData.country, allCountries]);

  // Get cities for selected state
  const availableCities = useMemo(() => {
    const selectedCountry = allCountries.find(
      (c) => c.name === formData.country
    );
    const selectedState = availableStates.find(
      (s) => s.name === formData.state
    );
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode
    );
  }, [formData.country, formData.state, availableStates, allCountries]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: keyof Godown, value: string): void => {
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
      }));
    } else if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        city: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      code: "",
      name: "",
      parent: godowns.length > 0 ? godowns[0].code : "primary",
      address: "",
      state: "",
      city: "",
      country: "India",
      isPrimary: false,
      status: "active",
      capacity: "",
      manager: "",
      contactNumber: "",
      createdAt: "",
      company: "",
    });
    setEditingGodown(null);
    setActiveTab("basic");
  };

  const handleEditGodown = (godown: Godown): void => {
    setEditingGodown(godown);
    setFormData({
      ...godown,
      id: godown.id || 0,
    });
    setOpen(true);
  };

  const handleDeleteGodown = (godownId: string): void => {
    deleteGodown(godownId);
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim()) {
      toast.error("Please enter Godown Code");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter Godown Name");
      return;
    }
    // if (!formData.company) {
    //   toast.error("Please select Company");
    //   return;
    // }

    const godownFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof Godown];
      if (value !== null && value !== undefined && value !== "") {
        godownFormData.append(key, String(value));
      }
    });

    if (editingGodown) {
      updateGodown(editingGodown._id || "", godownFormData);
    } else {
      addGodown(godownFormData);
    }
    setOpen(false);
    resetForm();
  };

  // Statistics calculations
  const stats = useMemo(
    () => ({
      totalGodowns: pagination?.total || 0,
      primaryGodowns: filteredGodowns?.filter((g) => g.isPrimary).length || 0,
      activeGodowns:
        statusFilter === "active"
          ? pagination?.total
          : filteredGodowns?.filter((g) => g.status === "active").length || 0,
      totalCapacity:
        filteredGodowns?.reduce(
          (sum, godown) => sum + (parseInt(godown.capacity) || 0),
          0
        ) || 0,
    }),
    [filteredGodowns, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location" },
    { id: "management", label: "Management" },
    { id: "settings", label: "Settings" },
  ];

  const headers = [
    "Godown",
    "Location",
    "Capacity",
    "Manager",
    "Status",
    "Actions",
  ];
  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGodowns.map((godown) => (
              <tr
                key={godown._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Warehouse className="h-10 w-10 text-teal-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {godown.name}
                      </div>
                      <div className="text-sm text-teal-600">{godown.code}</div>
                      <div className="flex items-center mt-1">
                        {godown.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs mr-1">
                            Primary
                          </Badge>
                        )}
                        {godown.parent !== "primary" && (
                          <span className="text-xs text-gray-500">
                            Parent: {godown.parent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-2" />
                      <span>
                        {[godown.city, godown.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {godown.address && (
                      <div className="text-xs text-gray-500 truncate max-w-48">
                        {godown.address}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <Building2 className="w-3 h-3 text-gray-400 mr-2" />
                      {godown.capacity} sq.ft
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    {godown.manager && (
                      <div className="flex items-center">
                        <Users className="w-3 h-3 text-gray-400 mr-2" />
                        <span>{godown.manager}</span>
                      </div>
                    )}
                    {godown.contactNumber && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-gray-400 mr-2" />
                        <span className="text-xs">{godown.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      godown.status === "active"
                        ? "bg-green-100 text-green-700"
                        : godown.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    } hover:bg-current`}
                  >
                    {godown.status.charAt(0).toUpperCase() +
                      godown.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckAccess
                    module="InventoryManagement"
                    subModule="Godown"
                    type="edit"
                  >
                    <ActionsDropdown
                      onEdit={() => handleEditGodown(godown)}
                      onDelete={() => handleDeleteGodown(godown._id || "")}
                      module="InventoryManagement"
                      subModule="Godown"
                    />
                  </CheckAccess>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredGodowns?.map((godown: Godown) => (
        <Card
          key={godown._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {godown.name}
                </CardTitle>
                <p className="text-teal-600 font-medium">{godown.code}</p>
                <div className="flex items-center mt-2 gap-2">
                  {godown.isPrimary && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Primary
                    </Badge>
                  )}
                  <Badge
                    className={`${
                      godown.status === "active"
                        ? "bg-green-100 text-green-700"
                        : godown.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    } hover:bg-current`}
                  >
                    {godown.status.charAt(0).toUpperCase() +
                      godown.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <CheckAccess
                module="InventoryManagement"
                subModule="Godown"
                type="edit"
              >
                <ActionsDropdown
                  onEdit={() => handleEditGodown(godown)}
                  onDelete={() => handleDeleteGodown(godown._id || "")}
                  module="InventoryManagement"
                  subModule="Godown"
                />
              </CheckAccess>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {godown.parent !== "primary" && (
                <div className="flex items-center text-sm">
                  <Warehouse className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Parent: {godown.parent}</span>
                </div>
              )}

              {(godown.city || godown.state) && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {[godown.city, godown.state].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              {godown.capacity && (
                <div className="flex items-center text-sm">
                  <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    Capacity: {godown.capacity} sq.ft
                  </span>
                </div>
              )}

              {godown.manager && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    Manager: {godown.manager}
                  </span>
                </div>
              )}

              {godown.contactNumber && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{godown.contactNumber}</span>
                </div>
              )}
            </div>

            {godown.address && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Address
                </p>
                <p className="text-xs text-gray-600">{godown.address}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Created: {new Date(godown.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="custopm-container">
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient
          title="Godown Management"
          subtitle="Manage your godown information and registrations"
        />
        <CheckAccess
          module="InventoryManagement"
          subModule="Godown"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              if (defaultSelected && companies.length > 0) {
                const selectedCompany = companies.find(
                  (c) => c._id === defaultSelected
                );
                if (selectedCompany) {
                  setFormData((prev) => ({
                    ...prev,
                    companyId: selectedCompany._id,
                  }));
                }
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Warehouse className="w-4 h-4" />
            Add Godown
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Godowns
                </p>
                <p className="text-2xl font-bold">{stats.totalGodowns}</p>
              </div>
              <Warehouse className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Primary Godowns
                </p>
                <p className="text-2xl font-bold">{stats.primaryGodowns}</p>
              </div>
              <Star className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Godowns
                </p>
                <p className="text-2xl font-bold">{stats.activeGodowns}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold">
                  {stats.totalCapacity} sq.ft
                </p>
              </div>
              <Building2 className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

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
          setSortBy("nameAsc");
          setCurrentPage(1);
        }}
      />
      {loading && <TableViewSkeleton />}

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={pagination?.total}
      />

      {pagination.total === 0 ? (
        <EmptyStateCard
          icon={Warehouse}
          title="No godowns registered yet"
          description="Create your first godown to get started"
          buttonLabel="Add Your First Godown"
          module="InventoryManagement"
          subModule="godown"
          type="create"
          onButtonClick={() => setOpen(true)}
        />
      ) : (
        <>
          {viewMode === "table" ? <TableView /> : <CardView />}

          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={pagination}
            itemName="godowns"
          />
        </>
      )}

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <CustomFormDialogHeader
            title={editingGodown ? "Edit Godown" : "Add New Godown"}
            subtitle={
              editingGodown
                ? "Update the godown details"
                : "Complete godown registration information"
            }
          />

          <MultiStepNav
            steps={tabs}
            currentStep={activeTab}
            onStepChange={setActiveTab}
            stepIcons={stepIcons}
          />

          <div className="flex-1 overflow-y-auto">
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
        icon={<Warehouse className="w-4 h-4 text-white" />}
        title="Godown Information"
        gradientFrom="from-teal-400"
        gradientTo="to-teal-500"
      /> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Godown Code"
                    placeholder="e.g., GDN001"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Godown Name"
                    placeholder="e.g., Main Warehouse"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={true}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Parent Godown
                    </label>
                    <select
                      value={formData.parent}
                      onChange={(e) =>
                        handleSelectChange("parent", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="primary">Primary (No Parent)</option>
                      {godowns
                        ?.filter((g) => g._id !== editingGodown?._id)
                        .map((godown) => (
                          <option key={godown._id} value={godown.code}>
                            {godown.name} ({godown.code})
                          </option>
                        ))}
                    </select>
                  </div>
                  {/* <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Company</label>
                    <select
                      value={formData.company}
                      onChange={(e) => handleSelectChange("company", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>{company.namePrint}</option>
                      ))}
                    </select>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <CustomInputBox
                    label="Capacity (sq.ft)"
                    placeholder="e.g., 10000"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    type="number"
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleSelectChange("status", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      checked={formData.isPrimary}
                      onChange={handleChange}
                      className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                    />
                    Set as Primary Godown
                  </label>
                </div>

                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={4}
                  showPrevious={false}
                  onNext={() => setActiveTab("location")}
                />
              </div>
            )}

            {activeTab === "location" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
                  icon={<MapPin className="w-4 h-4 text-white" />}
                  title="Location Information"
                  gradientFrom="from-blue-400"
                  gradientTo="to-blue-500"
                /> */}

                <div className="grid grid-cols-1 gap-6">
                  <CustomInputBox
                    label="Address"
                    placeholder="e.g., 123 Warehouse Lane"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          handleSelectChange("country", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        {allCountries.map((country) => (
                          <option key={country.isoCode} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          handleSelectChange("state", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                        disabled={availableStates.length === 0}
                      >
                        <option value="">Select State</option>
                        {availableStates.map((state) => (
                          <option key={state.isoCode} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        City
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          handleSelectChange("city", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                        disabled={availableCities.length === 0}
                      >
                        <option value="">Select City</option>
                        {availableCities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("basic")}
                  onNext={() => setActiveTab("management")}
                />
              </div>
            )}

            {activeTab === "management" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
        icon={<Users className="w-4 h-4 text-white" />}
        title="Management Details"
        gradientFrom="from-green-400"
        gradientTo="to-green-500"
      /> */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Manager Name"
                    placeholder="e.g., John Doe"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Contact Number"
                    placeholder="e.g., +1-234-567-8900"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>

                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("location")}
                  onNext={() => setActiveTab("settings")}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
        icon={<Settings2 className="w-4 h-4 text-white" />}
        title="Setting"
        gradientFrom="from-cyan-400"
        gradientTo="to-cyan-500"
      /> */}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Code:</strong> {formData.code || "Not specified"}
                    </p>
                    <p>
                      <strong>Name:</strong> {formData.name || "Not specified"}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {[formData.city, formData.state, formData.country]
                        .filter(Boolean)
                        .join(", ") || "Not specified"}
                    </p>
                    <p>
                      <strong>Capacity:</strong>{" "}
                      {formData.capacity
                        ? `${formData.capacity} sq.ft`
                        : "Not specified"}
                    </p>
                    <p>
                      <strong>Manager:</strong>{" "}
                      {formData.manager || "Not specified"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {formData.status.charAt(0).toUpperCase() +
                        formData.status.slice(1)}
                    </p>
                    <p>
                      <strong>Primary:</strong>{" "}
                      {formData.isPrimary ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>Parent:</strong>{" "}
                      {formData.parent === "primary" ? "None" : formData.parent}
                    </p>
                    <p>
                      <strong>Company:</strong>{" "}
                      {companies.find((c) => c._id === formData.company)
                        ?.namePrint || "Not specified"}
                    </p>
                  </div>
                </div>

                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={4}
                  onPrevious={() => setActiveTab("management")}
                  onSubmit={handleSubmit}
                  submitLabel={editingGodown ? "Update Godown" : "Save Godown"}
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

export default GodownRegistration;
