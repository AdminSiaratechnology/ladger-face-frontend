import { useState, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { MapPin, Warehouse, Plus, Users, Building2, FileText, Star } from "lucide-react";
import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";

// Godown interface
interface Godown {
  id: number;
  code: string;
  name: string;
  parent: string;
  address: string;
  state: string;
  city: string;
  country: string;
  isPrimary: boolean;
  status: string;
  capacity: string;
  manager: string;
  contactNumber: string;
  createdAt: string;
}

const GodownRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  
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
    });
  };

  const handleSubmit = (): void => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert("Please fill in Godown Code and Name");
      return;
    }

    // If this is set as primary, remove primary status from others
    let updatedGodowns = [...godowns];
    if (formData.isPrimary) {
      updatedGodowns = godowns.map(g => ({ ...g, isPrimary: false }));
    }

    const newGodown: Godown = { 
      ...formData, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setGodowns([...updatedGodowns, newGodown]);
    resetForm();
    setOpen(false);
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalGodowns: godowns.length,
    primaryGodowns: godowns.filter(g => g.isPrimary).length,
    activeGodowns: godowns.filter(g => g.status === 'active').length,
    totalCapacity: godowns.reduce((sum, godown) => sum + (parseInt(godown.capacity) || 0), 0)
  }), [godowns]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Godown Management</h1>
          <p className="text-gray-600">Manage your godown information and registrations</p>
        </div>
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Warehouse className="w-4 h-4 mr-2" />
          Add Godown
        </Button>
      </div>

      {/* Stats Cards */}
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

      {/* Godown List */}
      {godowns.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Warehouse className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No godowns registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first godown to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Add Your First Godown
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {godowns.map((godown: Godown) => (
            <Card key={godown.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                      {godown.name}
                    </CardTitle>
                    <p className="text-blue-600 font-medium">{godown.code}</p>
                    {godown.isPrimary && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mt-2">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge className={`${godown.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {godown.status}
                  </Badge>
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
                      <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Godown
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Fill in the godown details and registration information
            </p>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <Warehouse className="w-5 h-5 mr-2" />
                Godown Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <CustomInputBox
                  placeholder="Godown Code *"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                />
                <CustomInputBox
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
                  className="w-full h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="primary">Primary (No Parent)</option>
                  {godowns.map(godown => (
                    <option key={godown.id} value={godown.code}>{godown.name} ({godown.code})</option>
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
                  placeholder="Capacity (sq.ft)"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  type="number"
                />
                <select
                  value={formData.status}
                  onChange={(e) => handleSelectChange("status", e.target.value)}
                  className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <CustomInputBox
                  placeholder="Manager Name"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                />
                <CustomInputBox
                  placeholder="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <CustomInputBox
                  placeholder="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={formData.country}
                  onChange={(e) => handleSelectChange("country", e.target.value)}
                  className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                >
                  {allCountries.map(country => (
                    <option key={country.isoCode} value={country.name}>{country.name}</option>
                  ))}
                </select>
                
                <select
                  value={formData.state}
                  onChange={(e) => handleSelectChange("state", e.target.value)}
                  className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                  disabled={availableStates.length === 0}
                >
                  <option value="">Select State</option>
                  {availableStates.map(state => (
                    <option key={state.isoCode} value={state.name}>{state.name}</option>
                  ))}
                </select>
                
                <select
                  value={formData.city}
                  onChange={(e) => handleSelectChange("city", e.target.value)}
                  className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus:outline-none bg-white"
                  disabled={availableCities.length === 0}
                >
                  <option value="">Select City</option>
                  {availableCities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-teal-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 shadow-lg"
                >
                  Save Godown
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GodownRegistration;