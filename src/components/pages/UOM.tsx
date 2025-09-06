import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calculator, Building2, FileText, Star, Zap, Table, Grid3X3, Eye } from "lucide-react";

// Custom Input Box Component
const CustomInputBox = ({ placeholder, name, value, onChange, type = "text", label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
      {...props}
    />
  </div>
);

// Unit interface
interface Unit {
  id: number;
  name: string;
  type: 'simple' | 'compound';
  // Simple unit fields
  symbol?: string;
  decimalPlaces?: number;
  // Compound unit fields
  firstUnit?: string;
  conversion?: number;
  secondUnit?: string;
  createdAt: string;
}

// Form interface
interface UnitForm {
  name: string;
  type: 'simple' | 'compound';
  symbol: string;
  decimalPlaces: number;
  firstUnit: string;
  conversion: number;
  secondUnit: string;
}

const UnitManagement: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("simple");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); // Default to table
  
  // Initialize with dummy data
  const [units, setUnits] = useState<Unit[]>([
    // Simple units
    {
      id: 1,
      name: "Meter",
      type: 'simple',
      symbol: "m",
      decimalPlaces: 2,
      createdAt: "10/15/2023"
    },
    {
      id: 2,
      name: "Kilogram",
      type: 'simple',
      symbol: "kg",
      decimalPlaces: 3,
      createdAt: "10/16/2023"
    },
    {
      id: 3,
      name: "Second",
      type: 'simple',
      symbol: "s",
      decimalPlaces: 1,
      createdAt: "10/17/2023"
    },
    {
      id: 4,
      name: "Celsius",
      type: 'simple',
      symbol: "°C",
      decimalPlaces: 1,
      createdAt: "10/18/2023"
    },
    // Compound units
    {
      id: 5,
      name: "Kilometers per hour",
      type: 'compound',
      firstUnit: "Kilometer",
      conversion: 1,
      secondUnit: "Hour",
      createdAt: "10/19/2023"
    },
    {
      id: 6,
      name: "Newton",
      type: 'compound',
      firstUnit: "Kilogram",
      conversion: 1,
      secondUnit: "Meter per second squared",
      createdAt: "10/20/2023"
    }
  ]);
  
  const [form, setForm] = useState<UnitForm>({
    name: '',
    type: 'simple',
    symbol: '',
    decimalPlaces: 2,
    firstUnit: '',
    conversion: 1,
    secondUnit: '',
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
      symbol: '',
      decimalPlaces: 2,
      firstUnit: '',
      conversion: 1,
      secondUnit: '',
    });
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

    const newUnit: Unit = { 
      ...form, 
      id: Date.now(),
      type: activeTab as 'simple' | 'compound',
      createdAt: new Date().toLocaleDateString()
    };
    
    setUnits(prev => [...prev, newUnit]);
    resetForm();
    setOpen(false);
    setActiveTab("simple");
  };

  // Get simple units for compound unit dropdowns
  const simpleUnits = useMemo(() => 
    units.filter(u => u.type === 'simple'), 
    [units]
  );

  // Filter second unit options to exclude the first selected unit
  const filteredSecondUnitOptions = useMemo(() => {
    return simpleUnits.filter(unit => unit.name !== form.firstUnit);
  }, [simpleUnits, form.firstUnit]);

  // Statistics calculations
  const stats = useMemo(() => ({
    totalUnits: units.length,
    simpleUnits: units.filter(u => u.type === 'simple').length,
    compoundUnits: units.filter(u => u.type === 'compound').length,
  }), [units]);

  // Form tabs
  const tabs = [
    { id: "simple", label: "Simple Unit" },
    { id: "compound", label: "Compound Unit" }
  ];

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
                Created Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {units.map((unit) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {unit.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component (existing card view)
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {units.map((unit: Unit) => (
        <Card key={unit.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
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
                  {unit.symbol && (
                    <span className="text-teal-600 font-bold text-lg">({unit.symbol})</span>
                  )}
                </div>
              </div>
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
                <span className="text-gray-600">Created: {unit.createdAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xs font-bold text-gray-800 mb-2">Unit of Management</h1>
          <p className="text-gray-600">Manage your unit measurements and conversions</p>
        </div>
       
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* View Toggle */}
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

      {/* Units List */}
      {units.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calculator className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No units registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first unit to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Unit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
        </>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Unit
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Create a new unit measurement with specific properties
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
              {/* Simple Unit Tab */}
              {activeTab === "simple" && (
                <div className="bg-white p-4 rounded-lg">
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

                  <div className="mt-4">
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
                  </div>
                </div>
              )}

              {/* Compound Unit Tab */}
              {activeTab === "compound" && (
                <div className="bg-white p-4 rounded-lg">
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
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        First Unit *
                      </label>
                      <select
                        value={form.firstUnit}
                        onChange={(e) => handleSelectChange("firstUnit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select First Unit</option>
                        {simpleUnits.map((unit) => (
                          <option key={unit.id} value={unit.name}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Second Unit *
                      </label>
                      <select
                        value={form.secondUnit}
                        onChange={(e) => handleSelectChange("secondUnit", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
                      >
                        <option value="">Select Second Unit</option>
                        {filteredSecondUnitOptions.map((unit) => (
                          <option key={unit.id} value={unit.name}>
                            {unit.name} {unit.symbol && `(${unit.symbol})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                >
                  Save Unit
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