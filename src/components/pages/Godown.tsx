// Updated GodownRegistration with pagination and filters
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  MapPin, 
  Warehouse, 

  Users, 
  Building2, 
  FileText, 
  Star, 
  Phone, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Table, 
  Grid3X3,
  Settings2,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";
import {useGodownStore} from "../../../store/godownStore"
import {useCompanyStore} from "../../../store/companyStore"
import FilterBar from "../customComponents/FilterBar";
import HeaderGradient from "../customComponents/HeaderGradint";

// Godown interface (updated with status enum)
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
  status: 'active' | 'inactive' | 'maintenance';
  capacity: string;
  manager: string;
  contactNumber: string;
  createdAt: string;
  company: string
}

const GodownRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredGodowns, setFilteredGodowns] = useState<Godown[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page

  const { godowns, pagination, loading, error, fetchGodowns, addGodown, updateGodown, deleteGodown, filterGodowns } = useGodownStore();
  const {companies} = useCompanyStore()
  console.log(companies,"companess")

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
    code: '',
    name: '',
    parent: 'primary',
    address: '',
    state: '',
    city: '',
    country: 'India',
    isPrimary: false,
    status: 'active',
    capacity: '',
    company: "",
    manager: '',
    contactNumber: '',
    createdAt: '',
  });

  // Get all countries
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Get states for selected country
  const availableStates = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === formData.country);
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [formData.country, allCountries]);

  // Get cities for selected state
  const availableCities = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === formData.country);
    const selectedState = availableStates.find(s => s.name === formData.state);
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
  }, [formData.country, formData.state, availableStates, allCountries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: keyof Godown, value: string): void => {
    if (name === "country") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: "",
        city: ""
      }));
    } else if (name === "state") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      code: '',
      name: '',
      parent: godowns.length > 0 ? godowns[0].code : 'primary',
      address: '',
      state: '',
      city: '',
      country: 'India',
      isPrimary: false,
      status: 'active',
      capacity: '',
      manager: '',
      contactNumber: '',
      createdAt: '',
      company: companies.length > 0 ? companies[0]._id : ''
    });
    setEditingGodown(null);
    setActiveTab("basic");
  };

  const handleEditGodown = (godown: Godown): void => {
    setEditingGodown(godown);
    setFormData({
      ...godown,
      id: godown.id || 0 // Ensure id is set
    });
    setOpen(true);
  };

  const handleDeleteGodown = (godownId: string): void => {
    deleteGodown(godownId);
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Please fill in Godown Code and Name");
      return;
    }

    if (editingGodown) {
      updateGodown(editingGodown._id || '', formData);
    } else {
      addGodown(formData);
    }
    
    resetForm();
    setOpen(false);
  };

  // Statistics calculations (updated for pagination)
  const stats = useMemo(() => ({
    totalGodowns: pagination.total,
    primaryGodowns: filteredGodowns?.filter(g => g.isPrimary).length,
    activeGodowns: statusFilter === 'active' ? pagination?.total : filteredGodowns?.filter(g => g.status === 'active').length,
    totalCapacity: filteredGodowns?.reduce((sum, godown) => sum + (parseInt(godown.capacity) || 0), 0)
  }), [filteredGodowns, pagination, statusFilter]);

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "location", label: "Location" },
    { id: "management", label: "Management" },
    { id: "settings", label: "Settings" }
  ];

  // Actions dropdown component
  const ActionsDropdown = ({ godown }: { godown: Godown }) => {
    const [showActions, setShowActions] = useState(false);
    
    return (
      <div className="relative">
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
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleEditGodown(godown);
                  setShowActions(false);
                }}
                className="w-full justify-start text-left hover:bg-gray-50 rounded-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleDeleteGodown(godown._id || '');
                  setShowActions(false);
                }}
                className="w-full justify-start text-left rounded-none text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Table View Component (updated)
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Godown
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGodowns.map((godown) => (
              <tr key={godown.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Warehouse className="h-10 w-10 text-teal-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{godown.name}</div>
                      <div className="text-sm text-teal-600">{godown.code}</div>
                      <div className="flex items-center mt-1">
                        {godown.isPrimary && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs mr-1">
                            Primary
                          </Badge>
                        )}
                        {godown.parent !== 'primary' && (
                          <span className="text-xs text-gray-500">Parent: {godown.parent}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-2" />
                      <span>{[godown.city, godown.state].filter(Boolean).join(", ")}</span>
                    </div>
                    {godown.address && (
                      <div className="text-xs text-gray-500 truncate max-w-48">{godown.address}</div>
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
                  <Badge className={`${
                    godown.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : godown.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  } hover:bg-current`}>
                    {godown.status.charAt(0).toUpperCase() + godown.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown godown={godown} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component (updated)
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredGodowns?.map((godown: Godown) => (
        <Card key={godown.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
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
                  <Badge className={`${
                    godown.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : godown.status === 'maintenance'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  } hover:bg-current`}>
                    {godown.status.charAt(0).toUpperCase() + godown.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <ActionsDropdown godown={godown} />
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {godown.parent !== 'primary' && (
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
                  <span className="text-gray-600">Capacity: {godown.capacity} sq.ft</span>
                </div>
              )}
              
              {godown.manager && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">Manager: {godown.manager}</span>
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
                <p className="text-xs font-medium text-gray-500 mb-1">Address</p>
                <p className="text-xs text-gray-600">{godown.address}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created: {godown.createdAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Pagination controls
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-600">
        Showing {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} godowns
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
          onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex justify-between items-center mb-8">
       
        <HeaderGradient title="Godown Management"
        subtitle="Manage your godown information and registrations"/>
       
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Warehouse className="w-4 h-4 mr-2" />
          Add Godown
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Godowns</p>
                <p className="text-3xl font-bold">{stats.totalGodowns}</p>
              </div>
              <Warehouse className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Primary Godowns</p>
                <p className="text-3xl font-bold">{stats.primaryGodowns}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Godowns</p>
                <p className="text-3xl font-bold">{stats.activeGodowns}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Capacity</p>
                <p className="text-3xl font-bold">{stats.totalCapacity} sq.ft</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-200" />
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
          setSearchTerm('');
          setStatusFilter('all');
          setSortBy('nameAsc');
          setCurrentPage(1);
        }}
      />

      {pagination.total ? (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">View Mode:</span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="w-4 h-4 mr-2" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Card View
            </button>
          </div>
        </div>
      ) : null}

      {pagination.total === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Warehouse className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No godowns registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first godown to get started</p>
            <Button 
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Godown
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
          <PaginationControls />
        </>
      )}

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {editingGodown ? 'Edit Godown' : 'Add New Godown'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingGodown ? 'Update the godown details and registration information' : 'Fill in the godown details and registration information'}
            </p>
          </DialogHeader>
          
          <div className="flex border-0 outline-0 h-[100%] flex-1">
            {/* Form Tabs */}
            <div className="flex flex-wrap gap-2 flex-col bg-teal-50 w-52">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-md text-start font-semibold ring-0 rounded-none transition-colors ${
                    activeTab === tab.id
                      ? "bg-teal-600 text-white"
                      : "bg-teal-50 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6 w-full">
              {/* Basic Information Tab */}
              {activeTab === "basic" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Warehouse className="w-5 h-5 mr-2" />
                    Godown Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomInputBox
                      label="Godown Code *"
                      placeholder="Godown Code *"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      label="Godown Name *"
                      placeholder="Godown Name *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Parent Godown</label>
                    <select
                      value={formData.parent}
                      onChange={(e) => handleSelectChange("parent", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="primary">Primary (No Parent)</option>
                      {godowns?.filter(g => g._id !== editingGodown?._id).map(godown => (
                        <option key={godown._id} value={godown.code}>{godown.name} ({godown.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                    <select
                      value={formData.company}
                      onChange={(e) => handleSelectChange("company", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>{company.namePrint}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Set as Primary Godown
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomInputBox
                      label="Capacity (sq.ft)"
                      placeholder="Capacity (sq.ft)"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      type="number"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleSelectChange("status", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <div></div>
                    <Button onClick={() => setActiveTab("location")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Location
                    </Button>
                  </div>
                </div>
              )}

              {/* Location Information Tab */}
              {activeTab === "location" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location Information
                  </h3>
                  
                  <div className="mb-4">
                    <CustomInputBox
                      label="Address"
                      placeholder="Complete Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleSelectChange("country", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        {allCountries.map(country => (
                          <option key={country.isoCode} value={country.name}>{country.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleSelectChange("state", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                        disabled={availableStates.length === 0}
                      >
                        <option value="">Select State</option>
                        {availableStates.map(state => (
                          <option key={state.isoCode} value={state.name}>{state.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      <select
                        value={formData.city}
                        onChange={(e) => handleSelectChange("city", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                        disabled={availableCities.length === 0}
                      >
                        <option value="">Select City</option>
                        {availableCities.map(city => (
                          <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("basic")}>
                      Previous: Basic Info
                    </Button>
                    <Button onClick={() => setActiveTab("management")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Management
                    </Button>
                  </div>
                </div>
              )}

              {/* Management Information Tab */}
              {activeTab === "management" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Management Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <CustomInputBox
                      label="Manager Name"
                      placeholder="Manager Name"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      label="Contact Number"
                      placeholder="Contact Number"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("location")}>
                      Previous: Location
                    </Button>
                    <Button onClick={() => setActiveTab("settings")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Settings2 className="w-5 h-5 mr-2" />
                    Settings
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Summary</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Code:</strong> {formData.code || 'Not specified'}</p>
                      <p><strong>Name:</strong> {formData.name || 'Not specified'}</p>
                      <p><strong>Location:</strong> {[formData.city, formData.state, formData.country].filter(Boolean).join(', ') || 'Not specified'}</p>
                      <p><strong>Capacity:</strong> {formData.capacity ? `${formData.capacity} sq.ft` : 'Not specified'}</p>
                      <p><strong>Manager:</strong> {formData.manager || 'Not specified'}</p>
                      <p><strong>Status:</strong> {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</p>
                      <p><strong>Primary:</strong> {formData.isPrimary ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("management")}>
                      Previous: Management
                    </Button>
                    <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                      {editingGodown ? 'Update Godown' : 'Save Godown'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Save button for all tabs except settings */}
              {activeTab !== "settings" && (
                <div className="flex justify-end pt-4 px-4">
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                  >
                    {editingGodown ? 'Update Godown' : 'Save Godown'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GodownRegistration;