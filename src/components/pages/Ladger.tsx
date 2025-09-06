import { useState, useMemo, useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Building2, Globe, Phone, Mail, MapPin, CreditCard, FileText, Star, Plus, X, Upload, Image, FileEdit, Settings2, Users } from "lucide-react";
import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";
import {dummyVendors} from "../../lib/dummyData"

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

// Registration Document interface
interface RegistrationDocument {
  id: number;
  type: string;
  file: string;
  fileName: string;
}

// Ledger interface
interface Ledger {
  id: number;
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
  ledgerGroup: string;
  industryType: string;
  territory: string;
  ledgerStatus: string;
  companySize: string;
  contactPerson: string;
  designation: string;
  phoneNumber: string;
  mobileNumber: string;
  emailAddress: string;
  faxNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  website: string;
  currency: string;
  isFrozenAccount: boolean;
  disabled: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  banks: Bank[];
  externalSystemId: string;
  dataSource: string;
  ledgerPriority: string;
  leadSource: string;
  internalNotes: string;
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
}

const LedgerRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [ledgers, setLedgers] = useState<Ledger[]>(dummyVendors);
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
  const [documents, setDocuments] = useState<RegistrationDocument[]>([]);
  
  const [formData, setFormData] = useState<Ledger>({
    id: 0,
    ledgerType: 'individual',
    ledgerCode: '',
    ledgerName: '',
    shortName: '',
    ledgerGroup: '',
    industryType: '',
    territory: '',
    ledgerStatus: 'active',
    companySize: '',
    contactPerson: '',
    designation: '',
    phoneNumber: '',
    mobileNumber: '',
    emailAddress: '',
    faxNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    website: '',
    currency: 'INR',
    isFrozenAccount: false,
    disabled: false,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    swiftCode: '',
    externalSystemId: '',
    dataSource: 'manual',
    ledgerPriority: 'medium',
    leadSource: '',
    internalNotes: '',
    banks: [],
    logo: null,
    notes: '',
    createdAt: '',
    registrationDocs: [],
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

  // Currency mapping based on country
  const getCurrencyForCountry = (countryName: string): string => {
    const country = allCountries.find(c => c.name === countryName);
    if (!country) return "INR";
    
    const currencyMap: Record<string, string> = {
      'IN': 'INR',
      'US': 'USD',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD',
      'DE': 'EUR',
      'FR': 'EUR',
      'JP': 'JPY',
      'CN': 'CNY'
    };
    
    return currencyMap[country.isoCode] || country.currency || 'USD';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: keyof Ledger, value: string): void => {
    if (name === "country") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
        currency: getCurrencyForCountry(value)
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

    setFormData(prev => ({
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
    setFormData(prev => ({
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
          setFormData(prev => ({
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
          setFormData(prev => ({
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
    setFormData(prev => ({
      ...prev,
      registrationDocs: prev.registrationDocs.filter(doc => doc.id !== id)
    }));
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      ledgerType: 'individual',
      ledgerCode: '',
      ledgerName: '',
      shortName: '',
      ledgerGroup: '',
      industryType: '',
      territory: '',
      ledgerStatus: 'active',
      companySize: '',
      contactPerson: '',
      designation: '',
      phoneNumber: '',
      mobileNumber: '',
      emailAddress: '',
      faxNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      website: '',
      currency: 'INR',
      isFrozenAccount: false,
      disabled: false,
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      swiftCode: '',
      externalSystemId: '',
      dataSource: 'manual',
      ledgerPriority: 'medium',
      leadSource: '',
      internalNotes: '',
      banks: [],
      logo: null,
      notes: '',
      createdAt: '',
      registrationDocs: [],
    });
  };

  const handleSubmit = (): void => {
    if (!formData.ledgerName.trim() || !formData.emailAddress.trim()) {
      alert("Please fill in Ledger Name and Email Address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      alert("Please enter a valid email address");
      return;
    }

    const newLedger: Ledger = { 
      ...formData, 
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setLedgers(prev => [...prev, newLedger]);
    resetForm();
    setOpen(false);
    setActiveTab("basic");
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalLedgers: ledgers.length,
    activeLedgers: ledgers.filter(c => c.ledgerStatus === 'active').length
  }), [ledgers]);

  // Form tabs
  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ledger Management</h1>
          <p className="text-gray-600">Manage your ledger information and registrations</p>
        </div>
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Users className="w-4 h-4 mr-2" />
          Add Ledger
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Ledgers</p>
                <p className="text-3xl font-bold">{stats.totalLedgers}</p>
              </div>
              <Users className="w-8 h-8 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Active Ledgers</p>
                <p className="text-3xl font-bold">{stats.activeLedgers}</p>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Individual Accounts</p>
                <p className="text-3xl font-bold">{ledgers.filter(l => l.ledgerType === 'individual').length}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Business Accounts</p>
                <p className="text-3xl font-bold">{ledgers.filter(l => l.ledgerType === 'company').length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger List */}
      {ledgers.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No ledgers registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first ledger to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Ledger
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ledgers.map((ledger: Ledger) => (
            <Card key={ledger.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {ledger.logo && (
                      <img src={ledger.logo} alt="Ledger Logo" className="w-10 h-10 rounded-full mr-3 object-cover" />
                    )}
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                        {ledger.ledgerName}
                      </CardTitle>
                      {ledger.shortName && (
                        <p className="text-teal-600 font-medium">{ledger.shortName}</p>
                      )}
                      <p className="text-sm text-gray-500">{ledger.ledgerCode}</p>
                    </div>
                  </div>
                  <Badge className={`${ledger.ledgerStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                    {ledger.ledgerStatus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  {ledger.contactPerson && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{ledger.contactPerson}</span>
                    </div>
                  )}
                  
                  {(ledger.city || ledger.state || ledger.zipCode) && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">
                        {[ledger.city, ledger.state, ledger.zipCode].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {ledger.mobileNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{ledger.mobileNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{ledger.emailAddress}</span>
                  </div>
                  
                  {ledger.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                      <span className="text-teal-600 truncate">{ledger.website}</span>
                    </div>
                  )}
                </div>

                {/* Bank Accounts */}
                {ledger.banks.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">Bank Accounts</p>
                    <div className="space-y-2">
                      {ledger.banks.slice(0, 2).map(bank => (
                        <div key={bank.id} className="text-xs bg-gray-100 p-2 rounded">
                          <p className="font-medium truncate">{bank.bankName}</p>
                          <p className="text-gray-600 truncate">A/C: ••••{bank.accountNumber.slice(-4)}</p>
                        </div>
                      ))}
                      {ledger.banks.length > 2 && (
                        <p className="text-xs text-gray-500">+{ledger.banks.length - 2} more</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Currency */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{ledger.currency}</span>
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
              Add New Ledger
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              Fill in the ledger details and registration information
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
                    <Users className="w-5 h-5 mr-2" />
                    Ledger Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.ledgerType}
                      onChange={(e) => handleSelectChange("ledgerType", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                    </select>
                    <CustomInputBox
                      placeholder="Ledger Code *"
                      name="ledgerCode"
                      value={formData.ledgerCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <CustomInputBox
                      placeholder="Ledger Name *"
                      name="ledgerName"
                      value={formData.ledgerName}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Short Name"
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <select
                      value={formData.ledgerGroup}
                      onChange={(e) => handleSelectChange("ledgerGroup", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Ledger Group</option>
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="bank">Bank</option>
                      <option value="cash">Cash</option>
                    </select>
                    
                    <select
                      value={formData.industryType}
                      onChange={(e) => handleSelectChange("industryType", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Industry Type</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="services">Services</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="technology">Technology</option>
                    </select>
                    
                    <select
                      value={formData.territory}
                      onChange={(e) => handleSelectChange("territory", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Territory</option>
                      <option value="north">North</option>
                      <option value="south">South</option>
                      <option value="east">East</option>
                      <option value="west">West</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <select
                      value={formData.ledgerStatus}
                      onChange={(e) => handleSelectChange("ledgerStatus", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleSelectChange("companySize", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Company Size</option>
                      <option value="small">Small (1-50)</option>
                      <option value="medium">Medium (51-250)</option>
                      <option value="large">Large (251-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
                    </select>

                    <select
                      value={formData.currency}
                      onChange={(e) => handleSelectChange("currency", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setActiveTab("contact")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Contact
                    </Button>
                  </div>
                </div>
              )}

              {/* Contact Information Tab */}
              {activeTab === "contact" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <CustomInputBox
                      placeholder="Contact Person *"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomInputBox
                        placeholder="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                      <CustomInputBox
                        placeholder="Mobile Number"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                      />
                    </div>
                    <CustomInputBox
                      placeholder="Email Address *"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleChange}
                      type="email"
                    />
                    <CustomInputBox
                      placeholder="Fax Number"
                      name="faxNumber"
                      value={formData.faxNumber}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Address Line 1"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Address Line 2"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={formData.country}
                        onChange={(e) => handleSelectChange("country", e.target.value)}
                        className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                      >
                        {allCountries.map(country => (
                          <option key={country.isoCode} value={country.name}>{country.name}</option>
                        ))}
                      </select>
                      
                      <select
                        value={formData.state}
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
                        value={formData.city}
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
                    <CustomInputBox
                      placeholder="Zip/Pincode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    <CustomInputBox
                      placeholder="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("basic")}>
                      Previous: Basic Info
                    </Button>
                    <Button onClick={() => setActiveTab("bank")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Banking Details
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
                      value={bankForm.micrNumber}
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
                  {formData.banks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-teal-700">Added Banks:</h4>
                      {formData.banks.map(bank => (
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
                    <Button variant="outline" onClick={() => setActiveTab("contact")}>
                      Previous: Contact
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
                    Additional Settings
                  </h3>
                  
                  {/* Logo Upload */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-teal-700 mb-2">Ledger Logo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center overflow-hidden bg-white">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Ledger Logo" className="w-full h-full object-cover" />
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
                          {formData.logo ? "Change Logo" : "Upload Logo"}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG or JPG</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={formData.ledgerPriority}
                      onChange={(e) => handleSelectChange("ledgerPriority", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="vip">VIP</option>
                    </select>
                    
                    <select
                      value={formData.leadSource}
                      onChange={(e) => handleSelectChange("leadSource", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Lead Source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="advertising">Advertising</option>
                      <option value="social_media">Social Media</option>
                      <option value="cold_call">Cold Call</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFrozenAccount"
                        checked={formData.isFrozenAccount}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Frozen Account
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="disabled"
                        checked={formData.disabled}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Disabled
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-teal-700 mb-2">Internal Notes</p>
                    <textarea
                      placeholder="Add any additional notes about the ledger..."
                      name="internalNotes"
                      value={formData.internalNotes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("bank")}>
                      Previous: Bank Details
                    </Button>
                    <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                      Save Ledger
                    </Button>
                  </div>
                </div>
              )}

              {/* Save button for all tabs except the last one */}
              {activeTab !== "settings" && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                  >
                    Save Ledger
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

export default LedgerRegistration;