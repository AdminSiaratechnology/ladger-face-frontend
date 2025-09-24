import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Building2, Globe, Phone, Mail, MapPin, CreditCard, FileText, Star, Plus, X, Upload, Image, FileEdit, Settings2, Eye, Table, Grid3X3, Edit, Trash2, MoreHorizontal, Search } from "lucide-react";

import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";

import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";

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
  _id?: string;
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
  status: 'active' | 'inactive';
}

// Form interface - updated to handle FormData
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
  logo: File | null;
  logoPreview?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
  status: 'active' | 'inactive';
}

// Registration document interface - updated to handle File objects
interface RegistrationDocument {
  id: number;
  type: string;
  file: File;
  fileName: string;
  preview?: string;
}

const CompanyPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  const { companies, loading, error, fetchCompanies, addCompany, updateCompany, deleteCompany, filterCompanies } = useCompanyStore();

  console.log("Companies from store:", companies);

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

  useEffect(() => {
    fetchCompanies("68c1503077fd742fa21575df");
  }, [fetchCompanies]);

 useEffect(() => {
  const handler = setTimeout(() => {
    filterCompanies(searchTerm, statusFilter, sortBy, "68c1503077fd742fa21575df")
      .then((result) => {
        setFilteredCompanies(result);
      })
      .catch((err) => {
        console.error("Error filtering companies:", err);
      });
  }, 500); // 500ms debounce time

  return () => {
    clearTimeout(handler);
  };
}, [searchTerm, statusFilter, sortBy, filterCompanies]);


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
    logoPreview: undefined,
    notes: "",
    registrationDocs: [],
    status: "active",
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
    } else if (name === "status") {
      setForm(prev => ({
        ...prev,
        [name]: value as 'active' | 'inactive'
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

  // Logo upload handler - updated for FormData
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      
      setForm(prev => ({
        ...prev,
        logo: file,
        logoPreview: previewUrl
      }));
    }
  };

  const triggerLogoUpload = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Edit company handler - updated for FormData
  const handleEditCompany = (company: Company): void => {
    console.log("Editing company:", company);
    setEditingCompany(company);
    
    setForm({
      namePrint: company.namePrint,
      nameStreet: company.nameStreet,
      address1: company.address1,
      address2: company.address2,
      address3: company.address3,
      city: company.city,
      pincode: company.pincode,
      state: company.state,
      country: company.country,
      telephone: company.telephone,
      mobile: company.mobile,
      fax: company.fax,
      email: company.email,
      website: company.website,
      gstNumber: company.gstNumber,
      panNumber: company.panNumber,
      tanNumber: company.tanNumber,
      msmeNumber: company.msmeNumber,
      udyamNumber: company.udyamNumber,
      defaultCurrency: company.defaultCurrency,
      banks: company.banks || [],
      logo: null,
      logoPreview: company.logo,
      notes: company.notes,
      registrationDocs: [],
      status: company.status || 'active',
    });
    setOpen(true);
  };

  // Delete company handler
  const handleDeleteCompany = (companyId: string): void => {
    console.log("Attempting to delete company with ID:", companyId);
    deleteCompany(companyId);
  };

  // Clean up object URLs to prevent memory leaks
  const cleanupObjectUrls = (): void => {
    if (form.logoPreview && form.logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(form.logoPreview);
    }
    form.registrationDocs.forEach(doc => {
      if (doc.preview && doc.preview.startsWith('blob:')) {
        URL.revokeObjectURL(doc.preview);
      }
    });
  };

  // Reset form handler
  const resetForm = (): void => {
    cleanupObjectUrls();
    
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
      logoPreview: undefined,
      notes: "",
      registrationDocs: [],
      status: "active",
    });
    setEditingCompany(null);
    setActiveTab("basic");
  };

  // Handle submit - updated to create FormData
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

    // Create FormData object
    const formData = new FormData();
    
    // Append all text fields
    Object.keys(form).forEach(key => {
      const value = form[key as keyof CompanyForm];
      
      if (key === 'logo' || key === 'logoPreview' || key === 'registrationDocs' || key === 'banks') {
        return; // Handle these separately
      }
      
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });
    
    // Append banks as JSON string (since it's an array)
    formData.append('banks', JSON.stringify(form.banks));
    
    // Append logo file if exists
    if (form.logo) {
      formData.append('logo', form.logo);
    }
    
    // Append registration documents
    form.registrationDocs.forEach((doc) => {
      formData.append('registrationDocs', doc.file);
    });
    formData.append('registrationDocsTypes', JSON.stringify(form.registrationDocs.map(doc => doc.type)));
    
    // Add document count
    formData.append('registrationDocsCount', String(form.registrationDocs.length));

    // Append status
    formData.append('status', form.status);

    // Debug: Log FormData contents
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, { name: value.name, size: value.size, type: value.type });
      } else {
        console.log(`${key}:`, value);
      }
    }

    if (editingCompany) {
      console.log("Updating company with ID:", editingCompany._id || editingCompany.id);
      updateCompany({ companyId: editingCompany._id || String(editingCompany.id), companyData: formData });
    } else {
      addCompany(formData);
    }
    
    resetForm();
    setOpen(false);
  };

  // Document upload handler - updated for FormData
  const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      
      const newDoc: RegistrationDocument = {
        id: Date.now(),
        type,
        file: file,
        fileName: file.name,
        preview: previewUrl
      };
      
      setForm(prev => ({
        ...prev,
        registrationDocs: [...prev.registrationDocs, newDoc]
      }));
    }
  };

  // Remove document handler
  const removeDocument = (id: number) => {
    const docToRemove = form.registrationDocs.find(doc => doc.id === id);
    if (docToRemove && docToRemove.preview && docToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(docToRemove.preview);
    }
    
    setForm(prev => ({
      ...prev,
      registrationDocs: prev.registrationDocs.filter(doc => doc.id !== id)
    }));
  };

  // Statistics calculations
  const stats = useMemo(() => ({
    totalCompanies: filteredCompanies?.length || 0,
    gstRegistered: filteredCompanies?.filter(c => c?.gstNumber?.trim() !== "")?.length || 0,
    msmeRegistered: filteredCompanies?.filter(c => c?.msmeNumber?.trim() !== "")?.length || 0,
    activeCompanies: filteredCompanies?.filter(c => c?.status === "active")?.length || 0
  }), [filteredCompanies]);

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

  // Actions dropdown component
  const ActionsDropdown = ({ company }: { company: Company }) => {
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
                  handleEditCompany(company);
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
                  handleDeleteCompany(company._id || String(company.id));
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
          <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
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
            {filteredCompanies?.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {company.logo && (
                      <img 
                        src={company.logo} 
                        alt="Logo" 
                        className="h-10 w-10 rounded-full mr-3 object-cover" 
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{company.namePrint}</div>
                      {company.nameStreet && (
                        <div className="text-sm text-gray-500">{company.nameStreet}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 text-gray-400 mr-2" />
                      <span className="truncate max-w-48">{company.email}</span>
                    </div>
                    {company.mobile && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-gray-400 mr-2" />
                        <span>{company.mobile}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center">
                        <Globe className="w-3 h-3 text-gray-400 mr-2" />
                        <span className="truncate max-w-48 text-teal-600">{company.website}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {[company.city, company.state, company.pincode].filter(Boolean).join(", ")}
                  </div>
                  <div className="text-sm text-gray-500">{company.country}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {company.gstNumber && (
                      <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">
                        GST: {company.gstNumber}
                      </div>
                    )}
                    {company.udyamNumber && (
                      <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                        UDYAM: {company.udyamNumber}
                      </div>
                    )}
                    {company.panNumber && (
                      <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                        PAN: {company.panNumber}
                      </div>
                    )}
                    {!company.gstNumber && !company.udyamNumber && !company.panNumber && (
                      <span className="text-xs text-gray-400">No registrations</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={company.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                    {company?.status?.charAt(0)?.toUpperCase() + company?.status?.slice(1)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown company={company} />
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
      {filteredCompanies?.map((company: Company) => (
        <Card key={company.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {company.logo && (
                  <img 
                    src={company.logo} 
                    alt="Logo" 
                    className="h-10 w-10 rounded-full mr-3 object-cover" 
                  />
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
              <div className="flex items-center gap-2">
                <Badge className={company.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                   {company?.status?.charAt(0)?.toUpperCase() + company?.status?.slice(1)}
                </Badge>
                <ActionsDropdown company={company} />
              </div>
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

            {company.banks && company.banks.length > 0 && (
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient title="Company Management" subtitle="Manage your company information and registrations"/>
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

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

      {/* {((filteredCompanies && filteredCompanies.length > 0 )|| (searchTerm || loading)) && ( */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white rounded-md  p-4  shadow-sm ">
          <div className="relative w-full md:w-auto  flex-1 ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 border-gray-300 focus:border-teal-500 active:!ring-2 active:!ring-teal-500 !outline-0 !border-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full md:w-auto"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc')}
            className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full md:w-auto"
          >
            <option value="nameAsc">A-Z</option>
            <option value="nameDesc">Z-A</option>
            <option value="dateAsc">Oldest First</option>
            <option value="dateDesc">Newest First</option>
          </select>
        </div>
      {/* // )} */}

      {filteredCompanies && filteredCompanies.length  ?(
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
      ):null}

      {(!filteredCompanies || filteredCompanies.length === 0)? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No companies found</p>
            <p className="text-gray-400 text-sm mb-6">Create a new company or adjust your search filters</p>
            <Button 
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
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
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingCompany ? 'Update the company details and registration information' : 'Fill in the company details and registration information'}
            </p>
          </DialogHeader>
          <div className="flex border-0 outline-0 h-[100%] flex-1">
            
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
              {activeTab === "basic" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      label="Company Name (Street)"
                      placeholder="Company Name (Street)"
                      name="nameStreet"
                      value={form.nameStreet}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Company Name (Print) *"
                      label="Company Name (Print) *"
                      name="namePrint"
                      value={form.namePrint}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <CustomInputBox
                      placeholder="Street Address 1"
                      label="Street Address 1"
                      name="address1"
                      value={form.address1}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Street Address 2"
                      label="Street Address 2"
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
                      label="Pincode"
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

              {activeTab === "contact" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Mobile Number"
                      label="Mobile Number"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Telephone"
                      label="Telephone"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Fax"
                      label="Fax"
                      name="fax"
                      value={form.fax}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Email Address *"
                      label="Email Address *"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <CustomInputBox
                    placeholder="Website URL"
                    label="Website URL"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                  />
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("basic")}>
                      Previous: Basic Info
                    </Button>
                    <Button onClick={() => setActiveTab("registration")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Registration
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "registration" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Registration Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="GST Number"
                      label="GST Number"
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleChange}
                      maxLength={15}
                    />
                    <CustomInputBox
                      placeholder="PAN Number"
                      label="PAN Number"
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    <CustomInputBox
                      placeholder="TAN Number"
                      label="TAN Number"
                      name="tanNumber"
                      value={form.tanNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    <CustomInputBox
                      placeholder="MSME Number"
                      label="MSME Number"
                      name="msmeNumber"
                      value={form.msmeNumber}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      placeholder="Udyam Number"
                      label="Udyam Number"
                      name="udyamNumber"
                      value={form.udyamNumber}
                      onChange={handleChange}
                    />
                  </div>

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

              {activeTab === "bank" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Bank Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white rounded-lg border border-teal-200">
                    <CustomInputBox
                      placeholder="Account Holder Name *"
                      label="Account Holder Name *"
                      name="accountHolderName"
                      value={bankForm.accountHolderName}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="Account Number *"
                      label="Account Number *"
                      name="accountNumber"
                      value={bankForm.accountNumber}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="IFSC Code"
                      label="IFSC Code"
                      name="ifscCode"
                      value={bankForm.ifscCode}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="SWIFT Code"
                      label="SWIFT Code"
                      name="swiftCode"
                      value={bankForm.swiftCode}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="MICR Number"
                      label="MICR Number"
                      name="micrNumber"
                      value={bankForm.micrNumber}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="Bank Name *"
                      label="Bank Name *"
                      name="bankName"
                      value={bankForm.bankName}
                      onChange={handleBankChange}
                    />
                    <CustomInputBox
                      placeholder="Branch"
                      label="Branch"
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

              {activeTab === "branding" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Branding & Notes
                  </h3>
                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-teal-700 mb-2">Company Logo</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-300 flex items-center justify-center overflow-hidden bg-white">
                        {form.logoPreview ? (
                          <img src={form.logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
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

              {activeTab === "settings" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <Settings2 className="w-5 h-5 mr-2" />
                    Settings
                  </h3>
                  
                  <div className="mb-6">
                    <p className="text-sm font-medium text-teal-700 mb-2">Company Status</p>
                    <select
                      value={form.status}
                      onChange={(e) => handleSelectChange("status", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full md:w-1/2"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("branding")}>
                      Previous: Branding
                    </Button>
                    <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                      {editingCompany ? 'Update Company' : 'Save Company'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab !== "settings" && (
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-8 py-2 shadow-lg"
                  >
                    {editingCompany ? 'Update Company' : 'Save Company'}
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