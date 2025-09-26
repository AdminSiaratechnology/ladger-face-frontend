import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calculator, Building2, FileText, Star, Zap, Table, Grid3X3, Eye, Edit, Trash2, MoreHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import {useUOMStore} from "../../../store/uomStore";
import {useCompanyStore} from "../../../store/companyStore"
import { UQC_LIST } from "../../lib/UQC_List";
import { formatSimpleDate } from "../../lib/formatDates";
import { Input } from "../ui/input";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";

// Unit interface
interface Unit {
  id: number;
  _id?: string;
  name: string;
  type: 'simple' | 'compound';
  status: 'active' | 'inactive';
  // Simple unit fields
  symbol?: string;
  decimalPlaces?: number;
  // Compound unit fields
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt: string;
   companyId: string,
   UQC:string
}

// Form interface
interface UnitForm {
  name: string;
  type: 'simple' | 'compound';
  status: 'active' | 'inactive';
  symbol: string;
  decimalPlaces: number;
  firstUnit: string;
  conversion: number;
  secondUnit: string;
   companyId: string,
   UQC:string
}

const UnitManagement: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("simple");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const {fetchUnits, units, addUnit, updateUnit, deleteUnit, filterUnits, pagination, loading, error} = useUOMStore()
   const { companies } = useCompanyStore();
  
  // Initial fetch
  useEffect(() => {
    fetchUnits(currentPage, limit);
  }, [fetchUnits, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterUnits(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredUnits(result);
        })
        .catch((err) => {
          console.error("Error filtering units:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterUnits]);

  const [form, setForm] = useState<UnitForm>({
    name: '',
    type: 'simple',
    status: 'active',
    symbol: '',
    decimalPlaces: 2,
    firstUnit: '',
    conversion: 1,
    secondUnit: '',
    companyId:"",
    UQC:""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const handleSelectChange = (name: keyof UnitForm, value: string): void => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'simple',
      status: 'active',
      symbol: '',
      decimalPlaces: 2,
      firstUnit: '',
      conversion: 1,
      secondUnit: '',
      companyId: companies.length > 0 ? companies[0]._id : '',
      UQC: ""
    });
    setEditingUnit(null);
    setActiveTab("simple");
  };

  const handleEditUnit = (unit: Unit): void => {
    setEditingUnit(unit);
    setForm({
      name: unit.name,
      type: unit.type,
      status: unit.status,
      symbol: unit.symbol || '',
      decimalPlaces: unit.decimalPlaces || 2,
      firstUnit: unit.firstUnit || '',
      conversion: unit.conversion || 1,
      secondUnit: unit.secondUnit || '',
      companyId: unit.companyId,
      UQC: unit.UQC || ''
    });
    setActiveTab(unit.type);
    setOpen(true);
  };

  const handleDeleteUnit = (id: string): void => {
    console.log("delete id", id);
    deleteUnit(id);
  };

  const handleSubmit = (): void => {
    if (!form.name.trim()) {
      alert("Please fill in Unit Name");
      return;
    }

    // Validate based on type
    if (activeTab === 'simple') {
      if (!form.symbol?.trim()) {
        alert("Please fill in Symbol for Simple unit");
        return;
      }
    } else if (activeTab === 'compound') {
      if (!form.firstUnit?.trim() || !form.secondUnit?.trim()) {
        alert("Please select First Unit and Second Unit for Compound unit");
        return;
      }
      if (form.firstUnit === form.secondUnit) {
        alert("First Unit and Second Unit cannot be the same");
        return;
      }
    }

    const submitData = {
      name: form.name,
      type: activeTab as 'simple' | 'compound',
      status: form.status,
      ...(activeTab === 'simple' ? {
        symbol: form.symbol,
        decimalPlaces: form.decimalPlaces,
        UQC: form.UQC
      } : {
        firstUnit: form.firstUnit,
        conversion: form.conversion,
        secondUnit: form.secondUnit,
      }),
      companyId: form.companyId
    };

    if (editingUnit) {
      updateUnit({unitId: editingUnit._id || '', data: submitData});
    } else {
      addUnit(submitData);
    }
    
    resetForm();
    setOpen(false);
  };

  // Get simple units for compound unit dropdowns
  const simpleUnits = useMemo(() => 
    filteredUnits.filter(u => u.type === 'simple'), 
    [filteredUnits]
  );

  // Filter second unit options to exclude the first selected unit
  const filteredSecondUnitOptions = useMemo(() => {
    return simpleUnits.filter(unit => unit.name !== form.firstUnit);
  }, [simpleUnits, form.firstUnit]);

  // Statistics calculations
  const stats = useMemo(() => ({
    totalUnits: pagination.total,
    simpleUnits: filteredUnits.filter(u => u.type === 'simple').length,
    compoundUnits: filteredUnits.filter(u => u.type === 'compound').length,
    activeUnits: statusFilter === 'active' ? pagination.total : filteredUnits.filter(u => u.status === 'active').length
  }), [filteredUnits, pagination, statusFilter]);

  // Form tabs
  const tabs = [
    { id: "simple", label: "Simple Unit" },
    { id: "compound", label: "Compound Unit" }
  ];

  // Actions dropdown component
  const ActionsDropdown = ({ unit }: { unit: Unit }) => {
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
                  handleEditUnit(unit);
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
                  handleDeleteUnit(unit._id || unit.id.toString());
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

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUnits.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                      {unit.symbol && (
                        <div className="text-sm text-teal-600 font-bold">({unit.symbol})</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${unit.type === 'simple' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {unit.type}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {unit.type === 'simple' ? (
                      <div className="space-y-1">
                        {unit.symbol && <div><strong>Symbol:</strong> {unit.symbol}</div>}
                        {unit.decimalPlaces !== undefined && (
                          <div><strong>Decimal Places:</strong> {unit.decimalPlaces}</div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {unit.firstUnit && <div><strong>First Unit:</strong> {unit.firstUnit}</div>}
                        {unit.conversion && <div><strong>Conversion:</strong> {unit.conversion}</div>}
                        {unit.secondUnit && <div><strong>Second Unit:</strong> {unit.secondUnit}</div>}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${unit.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {unit.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatSimpleDate( unit.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown unit={unit} />
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
      {filteredUnits.map((unit: Unit) => (
        <Card key={unit._id || unit.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                  {unit.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`${unit.type === 'simple' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'} hover:bg-green-100`}>
                    {unit.type}
                  </Badge>
                  <Badge className={`${unit.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {unit.status}
                  </Badge>
                  {unit.symbol && (
                    <span className="text-teal-600 font-bold text-lg">({unit.symbol})</span>
                  )}
                </div>
              </div>
              <ActionsDropdown unit={unit} />
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {unit.type === 'simple' ? (
                <>
                  {unit.symbol && (
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Symbol: {unit.symbol}</span>
                    </div>
                  )}
                  {unit.decimalPlaces !== undefined && (
                    <div className="flex items-center text-sm">
                      <Calculator className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Decimal Places: {unit.decimalPlaces}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {unit.firstUnit && (
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">First Unit: {unit.firstUnit}</span>
                    </div>
                  )}
                  {unit.conversion && (
                    <div className="flex items-center text-sm">
                      <Calculator className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Conversion: {unit.conversion}</span>
                    </div>
                  )}
                  {unit.secondUnit && (
                    <div className="flex items-center text-sm">
                      <Building2 className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">Second Unit: {unit.secondUnit}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Created: {formatSimpleDate( unit.createdAt)}</span>
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
        Showing {(currentPage - 1) * pagination.limit + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} units
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
       
        <HeaderGradient title="Unit of Measurement"
        subtitle="Manage your unit measurements and conversions"/>
       
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Units</p>
                <p className="text-3xl font-bold">{stats.totalUnits}</p>
              </div>
              <Calculator className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Simple Units</p>
                <p className="text-3xl font-bold">{stats.simpleUnits}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Compound Units</p>
                <p className="text-3xl font-bold">{stats.compoundUnits}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Active Units</p>
                <p className="text-3xl font-bold">{stats.activeUnits}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
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
            <Calculator className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No units registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first unit to get started</p>
            <Button 
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Unit
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
              {editingUnit ? 'Edit Unit' : 'Add New Unit'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingUnit ? 'Update the unit details' : 'Create a new unit measurement with specific properties'}
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

            <div className="space-y-6 w-full p-4">
              {/* Common Fields */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Company</label>
                <select
                  value={form.companyId}
                  onChange={(e) => handleSelectChange("companyId", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                >
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.namePrint}
                    </option>
                  ))}
                </select>
              </div>

              {/* Simple Unit Tab */}
              {activeTab === "simple" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Simple Unit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Unit Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      label="Unit Name *"
                    />
                    <CustomInputBox
                      placeholder="Symbol"
                      name="symbol"
                      value={form.symbol}
                      onChange={handleChange}
                      label="Symbol *"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Number of Decimal Places"
                      name="decimalPlaces"
                      type="number"
                      min="0"
                      max="10"
                      value={form.decimalPlaces}
                      onChange={handleChange}
                      label="Decimal Places"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">UQC</label>
                      <select
                        value={form.UQC}
                        onChange={(e) => handleSelectChange("UQC", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        <option value="">Select UQC</option>
                        {UQC_LIST.map((uc) => (
                          <option key={uc.code} value={uc.code}>
                            {uc.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Compound Unit Tab */}
              {activeTab === "compound" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Compound Unit Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Unit Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      label="Unit Name *"
                    />
                    <CustomInputBox
                      placeholder="Conversion Factor"
                      name="conversion"
                      type="number"
                      step="0.01"
                      value={form.conversion}
                      onChange={handleChange}
                      label="Conversion Factor"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">First Unit *</label>
                      <select
                        value={form.firstUnit}
                        onChange={(e) => handleSelectChange("firstUnit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        <option value="">Select First Unit</option>
                        {simpleUnits.map((unit) => (
                          <option key={unit._id} value={unit.name}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Second Unit *</label>
                      <select
                        value={form.secondUnit}
                        onChange={(e) => handleSelectChange("secondUnit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        <option value="">Select Second Unit</option>
                        {filteredSecondUnitOptions.map((unit) => (
                          <option key={unit._id} value={unit.name}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                >
                  {editingUnit ? 'Update Unit' : 'Save Unit'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitManagement;