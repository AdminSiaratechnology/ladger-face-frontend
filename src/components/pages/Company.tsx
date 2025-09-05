import React, { useState, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Building2, Globe, Phone, Mail, MapPin, CreditCard, FileText, Star, Plus, X, Upload, Image, FileEdit,Settings2 } from "lucide-react";
// import { ICountry, IState, ICity } from 'country-state-city';
import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";

// Bank interface
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

// Company interface
interface Company {
  id: number;
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
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
}

// Form interface
interface CompanyForm {
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
  logo: string | null;
  notes: string;
   registrationDocs: RegistrationDocument[];
}

// Add new interface for registration documents
interface RegistrationDocument {
  id: number;
  type: string;
  file: string;
  fileName: string;
}

const CompanyPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bankForm, setBankForm] = useState<Bank>({
    id: Date.now(),
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    micrNumber: "",
    swiftCode: "",
    bankName: "",
    branch: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
   // Add state for registration documents
  const [documents, setDocuments] = useState<RegistrationDocument[]>([]);
  
  const [form, setForm] = useState<CompanyForm>({
    namePrint: "",
    nameStreet: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
    telephone: "",
    mobile: "",
    fax: "",
    email: "",
    website: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    msmeNumber: "",
    udyamNumber: "",
    defaultCurrency: "INR - Indian Rupee",
    banks: [],
    logo: null,
    notes: "",
    registrationDocs: [],
  });
 

  // Get all countries
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Get states for selected country
  const availableStates = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === form.country);
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [form.country, allCountries]);

  // Get cities for selected state
  const availableCities = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === form.country);
    const selectedState = availableStates.find(s => s.name === form.state);
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
  }, [form.country, form.state, availableStates, allCountries]);

  // Currency mapping based on country
  const getCurrencyForCountry = (countryName: string): string => {
    const country = allCountries.find(c => c.name === countryName);
    if (!country) return "INR - Indian Rupee";
    
    const currencyMap: Record<string, string> = {
      'IN': 'INR - Indian Rupee',
      'US': 'USD - US Dollar',
      'GB': 'GBP - British Pound',
      'CA': 'CAD - Canadian Dollar',
      'AU': 'AUD - Australian Dollar',
      'EU': 'EUR - Euro',
      'JP': 'JPY - Japanese Yen',
      'CN': 'CNY - Chinese Yuan'
    };
    
    return currencyMap[country.isoCode] || `${country.currency} - ${country.currency}`;
  };

  // Auto-set currency based on country selection
  const handleCountryChange = (countryName: string): void => {
    setForm(prev => ({
      ...prev,
      country: countryName,
      state: "",
      city: "",
      defaultCurrency: getCurrencyForCountry(countryName)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: keyof CompanyForm, value: string): void => {
    if (name === "country") {
      handleCountryChange(value);
    } else if (name === "state") {
      setForm(prev => ({
        ...prev,
        [name]: value,
        city: ""
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Bank form handlers
  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBank = (): void => {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.bankName) {
      alert("Please fill in at least Account Holder Name, Account Number, and Bank Name");
      return;
    }

    setForm(prev => ({
      ...prev,
      banks: [...prev.banks, { ...bankForm, id: Date.now() }]
    }));

    // Reset bank form
    setBankForm({
      id: Date.now(),
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      swiftCode: "",
      micrNumber: "",
      bankName: "",
      branch: ""
    });
  };

  const removeBank = (id: number): void => {
    setForm(prev => ({
      ...prev,
      banks: prev.banks.filter(bank => bank.id !== id)
    }));
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        if (event.target?.result) {
          setForm(prev => ({
            ...prev,
            logo: event.target.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLogoUpload = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (): void => {
    if (!form.namePrint.trim() || !form.email.trim()) {
      alert("Please fill in Company Name and Email");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Please enter a valid email address");
      return;
    }

    const newCompany: Company = { 
      ...form, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setCompanies(prev => [...prev, newCompany]);
    
    // Reset form to initial state
    setForm({
      namePrint: "",
      nameStreet: "",
      address1: "",
      address2: "",
      address3: "",
      city: "",
      pincode: "",
      state: "",
      country: "India",
      telephone: "",
      mobile: "",
      fax: "",
      email: "",
      website: "",
      gstNumber: "",
      panNumber: "",
      tanNumber: "",
      msmeNumber: "",
      udyamNumber: "",
      defaultCurrency: "INR - Indian Rupee",
      banks: [],
      logo: null,
      notes: "",
      registrationDocs: [],
    });
    
    setOpen(false);
    setActiveTab("basic");
  };
  // Document upload handler
  const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newDoc: RegistrationDocument = {
            id: Date.now(),
            type,
            file: event.target.result as string,
            fileName: file.name
          };
          setForm(prev => ({
            ...prev,
            registrationDocs: [...prev.registrationDocs, newDoc]
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove document handler
  const removeDocument = (id: number) => {
    setForm(prev => ({
      ...prev,
      registrationDocs: prev.registrationDocs.filter(doc => doc.id !== id)
    }));
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalCompanies: companies.length,
    gstRegistered: companies.filter(c => c.gstNumber.trim() !== "").length,
    msmeRegistered: companies.filter(c => c.msmeNumber.trim() !== "").length,
    activeCompanies: companies.length
  }), [companies]);

  // Common currencies for the dropdown
  const currencies: string[] = [
    "INR - Indian Rupee",
    "USD - US Dollar", 
    "EUR - Euro",
    "GBP - British Pound",
    "CAD - Canadian Dollar",
    "AUD - Australian Dollar",
    "JPY - Japanese Yen",
    "CNY - Chinese Yuan"
  ];

  // Form tabs
 const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact" },
    { id: "registration", label: "Registration" },
    { id: "bank", label: "Bank Details" },
    { id: "branding", label: "Branding" },
    { id: "settings", label: "Settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Management</h1>
          <p className="text-gray-600">Manage your company information and registrations</p>
        </div>
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Companies</p>
                <p className="text-3xl font-bold">{stats.totalCompanies}</p>
              </div>
              <Building2 className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">GST Registered</p>
                <p className="text-3xl font-bold">{stats.gstRegistered}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">MSME Registered</p>
                <p className="text-3xl font-bold">{stats.msmeRegistered}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active</p>
                <p className="text-3xl font-bold">{stats.activeCompanies}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      {companies.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No companies registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first company to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company: Company) => (
            <Card key={company.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {company.logo && (
                      <img src={company.logo} alt="Company Logo" className="w-10 h-10 rounded-full mr-3 object-cover" />
                    )}
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                        {company.namePrint}
                      </CardTitle>
                      {company.nameStreet && (
                        <p className="text-teal-600 font-medium">{company.nameStreet}</p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {(company.city || company.state || company.pincode) && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">
                        {[company.city, company.state, company.pincode].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {company.mobile && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{company.mobile}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{company.email}</span>
                  </div>
                  
                  {company.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-teal-600 truncate">{company.website}</span>
                    </div>
                  )}
                </div>

                {/* Registration Numbers */}
                {(company.gstNumber || company.udyamNumber || company.panNumber) && (
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {company.gstNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">GST</span>
                        <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                          {company.gstNumber}
                        </span>
                      </div>
                    )}
                    
                    {company.udyamNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">UDYAM</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                          {company.udyamNumber}
                        </span>
                      </div>
                    )}
                    
                    {company.panNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">PAN</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                          {company.panNumber}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Accounts */}
                {company.banks.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Bank Accounts</p>
                    <div className="space-y-2">
                      {company.banks.slice(0, 2).map(bank => (
                        <div key={bank.id} className="text-xs bg-gray-100 p-2 rounded">
                          <p className="font-medium truncate">{bank.bankName}</p>
                          <p className="text-gray-600 truncate">A/C: ••••{bank.accountNumber.slice(-4)}</p>
                        </div>
                      ))}
                      {company.banks.length > 2 && (
                        <p className="text-xs text-gray-500">+{company.banks.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Currency */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{company.defaultCurrency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Add New Company
            </DialogTitle>
            <p className="text-gray-600 text-sm ">
              Fill in the company details and registration information
            </p>
           
          </DialogHeader>
          <div className="flex  border-0 outline-0 h-[100%] flex-1 ">
           {/* <div className="flex flex-col"> */}
            
            {/* Form Tabs */}
            <div className="flex flex-wrap gap-2  flex-col bg-teal-50 w-52 ">
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
            {/* </div> */}
            </div>

          <div className="space-y-6  w-full">
            {/* Basic Information Tab */}
          {activeTab === "basic" && (
      <div className=" bg-white p-4 ">
        <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInputBox
            placeholder="Company Name (Street)"
            name="nameStreet"
            value={form.nameStreet}
           onChange={handleChange}
          
          />
          <CustomInputBox
            placeholder="Company Name (Print) *"
            name="namePrint"
            value={form.namePrint}
            onChange={handleChange}
          
          />
         
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <CustomInputBox
            placeholder="Street Address 1"
            name="address1"
            value={form.address1}
            onChange={handleChange}
       
          />
          <CustomInputBox
            placeholder="Street Address 2"
            name="address2"
            value={form.address2}
            onChange={handleChange}
          
          />
          <CustomInputBox
            placeholder="Street Address 3"
            name="address3"
            value={form.address3}
            onChange={handleChange}
       
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <select
            value={form.country}
            onChange={(e) => handleSelectChange("country", e.target.value)}
            className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
          >
            {allCountries.map(country => (
              <option key={country.isoCode} value={country.name}>{country.name}</option>
            ))}
          </select>
          
          <select
            value={form.state}
            onChange={(e) => handleSelectChange("state", e.target.value)}
            className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
            disabled={availableStates.length === 0}
          >
            <option value="">Select State</option>
            {availableStates.map(state => (
              <option key={state.isoCode} value={state.name}>{state.name}</option>
            ))}
          </select>
          
          <select
            value={form.city}
            onChange={(e) => handleSelectChange("city", e.target.value)}
            className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
            disabled={availableCities.length === 0}
          >
            <option value="">Select City</option>
            {availableCities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <CustomInputBox
            placeholder="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          
            maxLength={10}
          />
          <select
            value={form.defaultCurrency}
            onChange={(e) => handleSelectChange("defaultCurrency", e.target.value)}
            className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => setActiveTab("contact")} className="bg-teal-600 hover:bg-teal-700">
            Next: Contact
          </Button>
        </div>
      </div>
    )}

            {/* Address Information Tab */}
            {activeTab === "address" && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <CustomInputBox
                    placeholder="Street Address"
                    name="address1"
                    value={form.address1}
                    onChange={handleChange}
                   
                  />
                  <CustomInputBox
                    placeholder="Street Address"
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
             
                  />
                  <CustomInputBox
                    placeholder="Street Address"
                    name="address3"
                    value={form.address3}
                    onChange={handleChange}
           
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={form.country}
                      onChange={(e) => handleSelectChange("country", e.target.value)}
                      className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      {allCountries.map(country => (
                        <option key={country.isoCode} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={form.state}
                      onChange={(e) => handleSelectChange("state", e.target.value)}
                      className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      disabled={availableStates.length === 0}
                    >
                      <option value="">Select State</option>
                      {availableStates.map(state => (
                        <option key={state.isoCode} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                    
                    <select
                      value={form.city}
                      onChange={(e) => handleSelectChange("city", e.target.value)}
                      className="h-10 px-3 py-2 border border-blue-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      disabled={availableCities.length === 0}
                    >
                      <option value="">Select City</option>
                      {availableCities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <CustomInputBox
                    placeholder="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
               
                    maxLength={10}
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("basic")}>
                    Previous: Basic Info
                  </Button>
                  <Button onClick={() => setActiveTab("contact")} className="bg-teal-600 hover:bg-teal-700">
                    Next: Contact
                  </Button>
                </div>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === "contact" && (
              <div className= "bg-white p-4 ">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInputBox
                    placeholder="Mobile Number"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    
                  />
                  <CustomInputBox
                    placeholder="Telephone"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                   
                  />
                  <CustomInputBox
                    placeholder="Fax"
                    name="fax"
                    value={form.fax}
                    onChange={handleChange}
            
                  />
                  <CustomInputBox
                    placeholder="Email Address *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    
                  />
                </div>
                <CustomInputBox
                  placeholder="Website URL"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                
                />
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("address")}>
                    Previous: Address
                  </Button>
                  <Button onClick={() => setActiveTab("registration")} className="bg-teal-600 hover:bg-teal-700">
                    Next: Registration
                  </Button>
                </div>
              </div>
            )}

            {/* Registration Details Tab */}
           {activeTab === "registration" && (
      <div className="bg-white p-4 ">
        <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Registration Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInputBox
            placeholder="GST Number"
            name="gstNumber"
            value={form.gstNumber}
            onChange={(e:any)=>handleChange(e)}
           
            maxLength={15}
          />
          <CustomInputBox
            placeholder="PAN Number"
            name="panNumber"
            value={form.panNumber}
            onChange={handleChange}
           
            maxLength={10}
          />
          <CustomInputBox
            placeholder="TAN Number"
            name="tanNumber"
            value={form.tanNumber}
            onChange={handleChange}
            
            maxLength={10}
          />
          <CustomInputBox
            placeholder="MSME Number"
            name="msmeNumber"
            value={form.msmeNumber}
            onChange={handleChange}
          
          />
          <CustomInputBox
            placeholder="Udyam Number"
            name="udyamNumber"
            value={form.udyamNumber}
            onChange={handleChange}
         
          />
        </div>

        {/* Document Upload Section */}
        <div className="mt-6">
          <h4 className="font-medium text-teal-800 mb-3">Registration Documents</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['GST', 'PAN', 'TAN', 'MSME', 'Udyam'].map(docType => (
              <div key={docType} className="p-4 bg-white rounded-lg border border-teal-200">
                <p className="text-sm font-medium text-teal-700 mb-2">{docType} Document</p>
                <div className="flex items-center justify-between">
                  <Input
                    type="file"
                    id={`${docType.toLowerCase()}-doc`}
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(docType, e)}
                    accept="image/*,.pdf"
                  />
                  <label
                    htmlFor={`${docType.toLowerCase()}-doc`}
                    className="px-4 py-2 bg-teal-50 text-teal-700 rounded-md cursor-pointer hover:bg-teal-100 transition-colors flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </label>
                  {form.registrationDocs.find(doc => doc.type === docType) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(form.registrationDocs.find(doc => doc.type === docType)!.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {form.registrationDocs.find(doc => doc.type === docType) && (
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    {form.registrationDocs.find(doc => doc.type === docType)?.fileName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button variant="outline" onClick={() => setActiveTab("contact")}>
            Previous: Contact
          </Button>
          <Button onClick={() => setActiveTab("bank")} className="bg-teal-600 hover:bg-teal-700">
            Next: Bank Details
          </Button>
        </div>
      </div>
    )}


            {/* Bank Details Tab */}
            {activeTab === "bank" && (
              <div className="bg-white p-4">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Bank Details
                </h3>
                
                {/* Bank Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white rounded-lg border border-teal-200">
                  <CustomInputBox
                    placeholder="Account Holder Name *"
                    name="accountHolderName"
                    value={bankForm.accountHolderName}
                    onChange={handleBankChange}
                    
                  />
                  <CustomInputBox
                    placeholder="Account Number *"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankChange}
                  
                  />
                  <CustomInputBox
                    placeholder="IFSC Code"
                    name="ifscCode"
                    value={bankForm.ifscCode}
                    onChange={handleBankChange}
                 
                  />
                  <CustomInputBox
                    placeholder="SWIFT Code"
                    name="swiftCode"
                    value={bankForm.swiftCode}
                    onChange={handleBankChange}
                 
                  />
                  <CustomInputBox
                    placeholder="MICR Number"
                    name="micrNumber"
                    value={bankForm.mcrNumber}
                    onChange={handleBankChange}
                 
                  />
                  <CustomInputBox
                    placeholder="Bank Name *"
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankChange}
                   
                  />
                  <CustomInputBox
                    placeholder="Branch"
                    name="branch"
                    value={bankForm.branch}
                    onChange={handleBankChange}
                   
                  />
                  <div className="flex items-end">
                    <Button onClick={addBank} className="bg-teal-600 hover:bg-teal-700 w-full">
                      <Plus className="w-4 h-4 mr-1" /> Add Bank
                    </Button>
                  </div>
                </div>

                {/* Bank List */}
                {form.banks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-teal-700">Added Banks:</h4>
                    {form.banks.map(bank => (
                      <div key={bank.id} className="p-3 bg-white rounded-lg border border-teal-200 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{bank.bankName}</p>
                          <p className="text-sm text-gray-600">{bank.accountHolderName} ••••{bank.accountNumber.slice(-4)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeBank(bank.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("registration")}>
                    Previous: Registration
                  </Button>
                  <Button onClick={() => setActiveTab("branding")} className="bg-teal-600 hover:bg-teal-700">
                    Next: Branding
                  </Button>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="bg-white p-4">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Branding & Notes
                </h3>
                
                {/* Logo Upload */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-teal-700 mb-2">Company Logo</p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center overflow-hidden bg-white">
                      {form.logo ? (
                        <img src={form.logo} alt="Company Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-8 h-8 text-teal-300" />
                      )}
                    </div>
                    <div>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button 
                        onClick={triggerLogoUpload}
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {form.logo ? "Change Logo" : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG or JPG</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-sm font-medium text-teal-700 mb-2">Company Notes</p>
                  <textarea
                    placeholder="Add any additional notes about the company..."
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("bank")}>
                    Previous: Bank Details
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
                
                {/* Logo Upload
                <div className="mb-6">
                  <p className="text-sm font-medium text-teal-700 mb-2">Company Logo</p>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center overflow-hidden bg-white">
                      {form.logo ? (
                        <img src={form.logo} alt="Company Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-8 h-8 text-teal-300" />
                      )}
                    </div>
                    <div>
                      <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button 
                        onClick={triggerLogoUpload}
                        variant="outline"
                        className="border-teal-300 text-teal-700 hover:bg-teal-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {form.logo ? "Change Logo" : "Upload Logo"}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG or JPG</p>
                    </div>
                  </div>
                </div> */}

                {/* Notes */}
                {/* <div>
                  <p className="text-sm font-medium text-teal-700 mb-2">Company Notes</p>
                  <textarea
                    placeholder="Add any additional notes about the company..."
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none resize-none"
                  />
                </div> */}

                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("branding")}>
                    Previous: Branding
                  </Button>
                  <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                    Save Company
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation for all tabs except the last one */}
            {activeTab !== "settings" && (
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                >
                  Save Company
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

export default CompanyPage;