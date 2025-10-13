import React, { useState, useMemo,  useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Building2, Globe, Phone, Mail, MapPin, CreditCard, FileText, Star, Plus, X, Upload, Image as ImageIcon,  Settings2,  ArrowBigDownDash, Users } from "lucide-react";

import { Country, State, City } from 'country-state-city';
import CustomInputBox from "../customComponents/CustomInputBox";

import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import api from "../../api/api";
import { TableViewSkeleton } from "../../components/customComponents/TableViewSkeleton";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import MultiStepNav from "../customComponents/MultiStepNav";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { toast } from "sonner";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import ImagePreviewDialog from "../customComponents/ImagePreviewDialog";

// Bank interface (unchanged)
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

// Company interface (unchanged)
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

// Form interface (unchanged)
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
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
  status: 'active' | 'inactive';
}

// Registration document interface (unchanged)
interface RegistrationDocument {
  id: number;
  type: string;
  file: File;
  fileName: string;
  previewUrl: string;
}

const stepIcons = {
  basic: <Building2 className="w-2 h-2 md:w-5 md:h-5 " />,
  contact: <Phone className="w-2 h-2 md:w-5 md:h-5 " />,
  registration: <FileText className="w-2 h-2 md:w-5 md:h-5 " />,
  bank: <CreditCard className="w-2 h-2 md:w-5 md:h-5 " />,
  branding: <ImageIcon className="w-2 h-2 md:w-5 md:h-5 " />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5 " />
};

const CompanyPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
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
  const [viewingImage, setViewingImage] = useState<RegistrationDocument | {previewUrl: string, type: 'logo'} | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { companies, pagination, loading, error, fetchCompanies, addCompany, updateCompany, deleteCompany, filterCompanies } = useCompanyStore();

  console.log("Companies from store:", companies);

  const [formData, setFormData] = useState<CompanyForm>({
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
    defaultCurrency: "INR",
    banks: [],
    notes: "",
    registrationDocs: [],
    status: "active",
  });

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === formData.country);
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [formData.country, allCountries]);

  const availableCities = useMemo(() => {
    const selectedCountry = allCountries.find(c => c.name === formData.country);
    const selectedState = availableStates.find(s => s.name === formData.state);
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
  }, [formData.country, formData.state, availableStates, allCountries]);

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

  const handleSelectChange = (name: keyof CompanyForm, value: string): void => {
    if (name === "country") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
        defaultCurrency: getCurrencyForCountry(value)
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

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBankForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBank = (): void => {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.bankName) {
      toast.error("Please fill in at least Account Holder Name, Account Number, and Bank Name");
      return;
    }

    setFormData(prev => ({
      ...prev,
      banks: [...prev.banks, { ...bankForm, id: Date.now() }]
    }));

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        logoFile: file,
        logoPreviewUrl: previewUrl
      }));
    }
  };

  const removeLogo = (): void => {
    if (formData.logoPreviewUrl && formData.logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setFormData(prev => ({
      ...prev,
      logoFile: undefined,
      logoPreviewUrl: undefined
    }));
  };

  const handleDocumentUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      
      const newDoc: RegistrationDocument = {
        id: Date.now(),
        type,
        file,
        previewUrl,
        fileName: file.name
      };
      
      setFormData(prev => ({
        ...prev,
        registrationDocs: [...prev.registrationDocs.filter(doc => doc.type !== type), newDoc]
      }));
    }
  };

  const removeDocument = (id: number) => {
    const docToRemove = formData.registrationDocs.find(doc => doc.id === id);
    if (docToRemove && docToRemove.previewUrl && docToRemove.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(docToRemove.previewUrl);
    }
    
    setFormData(prev => ({
      ...prev,
      registrationDocs: prev.registrationDocs.filter(doc => doc.id !== id)
    }));
  };

  const cleanupImageUrls = (): void => {
    // Clean up logo
    if (formData.logoPreviewUrl && formData.logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    
    // Clean up documents
    formData.registrationDocs.forEach(doc => {
      if (doc.previewUrl && doc.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  };

  const resetForm = () => {
    cleanupImageUrls();
    
    setFormData({
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
      defaultCurrency: "INR",
      banks: [],
      notes: "",
      registrationDocs: [],
      status: "active",
    });
    setEditingCompany(null);
    setActiveTab("basic");
  };

  const handleEditCompany = (company: Company): void => {
    setEditingCompany(company);
    setFormData({
      ...company,
      logoPreviewUrl: company.logo || undefined,
      registrationDocs: company.registrationDocs.map(doc => ({
        ...doc,
        previewUrl: doc.previewUrl // Assuming previewUrl is URL or base64, adjust if needed
      }))
    });
    setOpen(true);
  };

  const handleDeleteCompany = (id: string): void => {
    deleteCompany(id);
  };

  const handleSubmit = (): void => {
    if (!formData.namePrint.trim()) {
      toast.error("Please enter Company Name (Print)");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter Email Address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.country) {
      toast.error("Please select Country");
      return;
    }
    if (!formData.pincode.trim()) {
      toast.error("Please enter Pincode");
      return;
    }

    const companyFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof CompanyForm];
      
      if (key === 'registrationDocs' || key === 'banks' || key === 'logoFile' || key === 'logoPreviewUrl') {
        return;
      }
      
      if (value !== null && value !== undefined && value !== '') {
        companyFormData.append(key, String(value));
      }
    });
    
    companyFormData.append('banks', JSON.stringify(formData.banks));
    
    if (formData.logoFile) {
      companyFormData.append('logo', formData.logoFile);
    }
    
    formData.registrationDocs.forEach((doc) => {
      companyFormData.append('registrationDocs', doc.file);
    });
    companyFormData.append('registrationDocTypes', JSON.stringify(formData.registrationDocs.map(doc => doc.type)));
    companyFormData.append('registrationDocsCount', String(formData.registrationDocs.length));

    if (editingCompany) {
      updateCompany({ companyId: editingCompany._id || '', companyData: companyFormData });
    } else {
      addCompany(companyFormData);
    }
  };

  const stats = useMemo(() => ({
    totalCompanies: pagination?.total,
    gstRegistered: filteredCompanies?.filter(c => c.gstNumber?.trim() !== "").length,
    msmeRegistered: filteredCompanies?.filter(c => c.msmeNumber?.trim() !== "").length,
    activeCompanies: statusFilter === 'active' ? pagination?.total : filteredCompanies?.filter(c => c.status === "active").length
  }), [filteredCompanies, pagination, statusFilter]);

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "registration", label: "Registration Details" },
    { id: "bank", label: "Banking Details" },
    { id: "branding", label: "Branding" },
    { id: "settings", label: "Settings" }
  ];

  // Initial fetch
  useEffect(() => {
    fetchCompanies("68c1503077fd742fa21575df", currentPage, limit);
  }, [fetchCompanies, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterCompanies(searchTerm, statusFilter, sortBy, "68c1503077fd742fa21575df", currentPage, limit)
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
  }, [searchTerm, statusFilter, sortBy, currentPage, filterCompanies]);

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  const headers=["Company", "Contact", "Address", "Status", "Actions"];

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
         
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr key={company._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{company.namePrint}</div>
                    <div className="text-sm text-gray-500">{company.nameStreet}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div>Email: {company.email}</div>
                    <div>Phone: {company.mobile}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    company.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {company.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown
                    onEdit={() => handleEditCompany(company)}
                    onDelete={() => handleDeleteCompany(company._id || '')}
                    module="BusinessManagement" subModule="Company" 
                  />
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
      {filteredCompanies.map((company: Company) => (
        <Card key={company._id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
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
              <div className="flex items-center gap-2">
                <Badge className={`${company.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {company.status}
                </Badge>
                <ActionsDropdown
                  onEdit={() => handleEditCompany(company)}
                  onDelete={() => handleDeleteCompany(company._id || '')}
                  module="BusinessManagement" subModule="Company" 
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {company.nameStreet && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{company.nameStreet}</span>
                </div>
              )}
              
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

            {(company.gstNumber || company.msmeNumber || company.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {company.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">GST</span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {company.gstNumber}
                    </span>
                  </div>
                )}
                
                {company.msmeNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">MSME</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                      {company.msmeNumber}
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

 

  const downloadPDF = async () => {
    const res = await api.downloadCompanyPDF()
    console.log(res,"pdfresss")
  };

  return (
    <div className=" custom-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <HeaderGradient title="Company Management" subtitle="Manage your company information and registrations"/>
        <div className="flex gap-2">
          <CheckAccess module="BusinessManagement" subModule="Company" type="create">
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
          </CheckAccess>
          <Button onClick={downloadPDF} className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            Integration PDF <ArrowBigDownDash />
          </Button>
        </div>
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
      {loading && <TableViewSkeleton/>}

     
       <ViewModeToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              totalItems={pagination?.total} 
            />

      {pagination?.total === 0 ? (
      <EmptyStateCard
      icon={Building2}
      title="No companies registered yet"
      description="Create your first company to get started"
      buttonLabel="Add Your First Company"
      module="BusinessManagement"
      subModule="Company"
      type="create"
      onButtonClick={() => setOpen(true)}
    />
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
             <PaginationControls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
        itemName="companies"
      />
        </>
      )}

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          resetForm();
        }
      }}>
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title={editingCompany ? "Edit Company" : "Add New Company"}
            subtitle={
              editingCompany
                ? "Update the company details"
                : "Complete company registration information"
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
                
                    <SectionHeader
        icon={<Users className="w-4 h-4 text-white" />}
        title="Company Information"
        gradientFrom="from-blue-400"
        gradientTo="to-blue-500"
      />  

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Company Name (Street)"
                    placeholder="e.g., ABC Corp Street Name"
                    name="nameStreet"
                    value={formData.nameStreet}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Company Name (Print)"
                    placeholder="e.g., ABC Corporation"
                    name="namePrint"
                    value={formData.namePrint}
                    onChange={handleChange}
                    required={true}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6">
                  <CustomInputBox
                    label="Address Line 1"
                    placeholder="e.g., 123 Main St"
                    name="address1"
                    value={formData.address1}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Address Line 2"
                    placeholder="e.g., Apt 4B"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Address Line 3"
                    placeholder="e.g., Building Name"
                    name="address3"
                    value={formData.address3}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleSelectChange("country", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      {allCountries.map(country => (
                        <option key={country.isoCode} value={country.name}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleSelectChange("state", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      disabled={availableStates.length === 0}
                    >
                      <option value="">Select State</option>
                      {availableStates.map(state => (
                        <option key={state.isoCode} value={state.name}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleSelectChange("city", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      disabled={availableCities.length === 0}
                    >
                      <option value="">Select City</option>
                      {availableCities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <CustomInputBox
                    label="Zip/Pincode"
                    placeholder="e.g., 12345"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required={true}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Default Currency</label>
                    <select
                      value={formData.defaultCurrency}
                      onChange={(e) => handleSelectChange("defaultCurrency", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                  </div>
                </div>

                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={6}
                  showPrevious={false}
                  onNext={() => setActiveTab("contact")}
                />
              </div>
            )}

            {activeTab === "contact" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
               
                    <SectionHeader
        icon={<Users className="w-4 h-4 text-white" />}
        title="Contact Details"
        gradientFrom="from-green-400"
        gradientTo="to-green-500"
      />  
                
                <div className="grid grid-cols-1 gap-6">
                  <CustomInputBox
                    label="Telephone"
                    placeholder="e.g., +1-234-567-8900"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Mobile Number"
                    placeholder="e.g., +1-234-567-8900"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Fax Number"
                    placeholder="e.g., +1-234-567-8900"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Email Address"
                    placeholder="e.g., info@example.com"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    required={true}
                  />
                  <CustomInputBox
                    label="Website"
                    placeholder="e.g., https://example.com"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                
                <CustomStepNavigation
                  currentStep={2}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("basic")}
                  onNext={() => setActiveTab("registration")}
                />
              </div>
            )}

            {activeTab === "registration" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <SectionHeader
                  icon={<Users className="w-4 h-4 text-white" />}
                  title="Registration Details"
                  gradientFrom="from-yellow-400"
        gradientTo="to-yellow-500"
      />  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="GST Number"
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    maxLength={15}
                  />
                  <CustomInputBox
                    label="PAN Number"
                    placeholder="e.g., ABCDE1234F"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    maxLength={10}
                  />
                  <CustomInputBox
                    label="TAN Number"
                    placeholder="e.g., ABCD12345E"
                    name="tanNumber"
                    value={formData.tanNumber}
                    onChange={handleChange}
                    maxLength={10}
                  />
                  <CustomInputBox
                    label="MSME Number"
                    placeholder="e.g., UDYAM-XX-00-0000000"
                    name="msmeNumber"
                    value={formData.msmeNumber}
                    onChange={handleChange}
                    maxLength={20}
                  />
                  <CustomInputBox
                    label="Udyam Number"
                    placeholder="e.g., UDYAM-XX-00-0000000"
                    name="udyamNumber"
                    value={formData.udyamNumber}
                    onChange={handleChange}
                    maxLength={20}
                  />
                </div>

                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("contact")}
                  onNext={() => setActiveTab("bank")}
                />
              </div>
            )}

            {activeTab === "bank" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                
                    <SectionHeader
        icon={<Building2 className="w-4 h-4 text-white" />}
        title="Banking Details"
        gradientFrom="from-blue-400"
        gradientTo="to-blue-500"
      />  

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-white rounded-lg border-2 border-gray-200 shadow-inner">
                  <CustomInputBox
                    label="Account Holder Name *"
                    placeholder="e.g., John Doe"
                    name="accountHolderName"
                    value={bankForm.accountHolderName}
                    onChange={handleBankChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Account Number *"
                    placeholder="e.g., 123456789012"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="IFSC Code"
                    placeholder="e.g., SBIN0001234"
                    name="ifscCode"
                    value={bankForm.ifscCode}
                    onChange={handleBankChange}
                  />
                  <CustomInputBox
                    label="SWIFT Code"
                    placeholder="e.g., SBININBBXXX"
                    name="swiftCode"
                    value={bankForm.swiftCode}
                    onChange={handleBankChange}
                  />
                  <CustomInputBox
                    label="MICR Number"
                    placeholder="e.g., 110002001"
                    name="micrNumber"
                    value={bankForm.micrNumber}
                    onChange={handleBankChange}
                  />
                  <CustomInputBox
                    label="Bank Name *"
                    placeholder="e.g., State Bank of India"
                    name="bankName"
                    value={bankForm.bankName}
                    onChange={handleBankChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Branch"
                    placeholder="e.g., Main Branch"
                    name="branch"
                    value={bankForm.branch}
                    onChange={handleBankChange}
                  />
                  <Button 
                    onClick={addBank} 
                    className="col-span-1 md:col-span-2 h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Bank
                  </Button>
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

                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("registration")}
                  onNext={() => setActiveTab("branding")}
                />
              </div>
            )}

            {activeTab === "branding" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
               
                    <SectionHeader
        icon={<ImageIcon className="w-4 h-4 text-white" />}
        title="Branding & Documents"
        gradientFrom="from-purple-400"
        gradientTo="to-purple-500"
      />

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">Company Logo</h4>
                  <div className="p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shadow-inner">
                    <input
                      type="file"
                      id="logo"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                    <label
                      htmlFor="logo"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-200 transition-colors">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Upload Logo</p>
                    </label>
                    {formData.logoPreviewUrl && (
                      <div className="mt-4 relative">
                        <img
                          src={formData.logoPreviewUrl}
                          alt="Company Logo"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setViewingImage({previewUrl: formData.logoPreviewUrl, type: 'logo'})}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                          onClick={removeLogo}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">Registration Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['GST', 'PAN', 'TAN', 'MSME', 'UDYAM'].map(docType => (
                      <div key={docType} className="p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shadow-inner relative">
                        <p className="text-sm font-semibold text-gray-700 mb-3">{docType} Document</p>
                        <input
                          type="file"
                          id={`${docType.toLowerCase()}-doc`}
                          className="hidden"
                          onChange={(e) => handleDocumentUpload(docType, e)}
                          accept="image/*,.pdf"
                        />
                        <label
                          htmlFor={`${docType.toLowerCase()}-doc`}
                          className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors p-4 rounded-lg"
                        >
                          <Upload className="w-6 h-6 text-blue-500" />
                          <p className="text-sm text-gray-600">Upload</p>
                        </label>
                        {formData.registrationDocs.find(doc => doc.type === docType) && (
                          <div className="mt-4 w-full">
                            <p className="text-xs text-gray-500 truncate mb-2">
                              {formData.registrationDocs.find(doc => doc.type === docType)?.fileName}
                            </p>
                            {formData.registrationDocs.find(doc => doc.type === docType)?.previewUrl && docType !== 'PDF' && (
                              <img
                                src={formData.registrationDocs.find(doc => doc.type === docType)?.previewUrl}
                                alt={`${docType} document`}
                                className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                                onClick={() => setViewingImage(formData.registrationDocs.find(doc => doc.type === docType)!)}
                              />
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 w-6 h-6 rounded-full"
                              onClick={() => removeDocument(formData.registrationDocs.find(doc => doc.type === docType)!.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <CustomStepNavigation
                  currentStep={5}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("bank")}
                  onNext={() => setActiveTab("settings")}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <SectionHeader
                  icon={<Settings2 className="w-4 h-4 text-white" />}
                  title="Settings"
                  gradientFrom="from-cyan-400"
        gradientTo="to-cyan-500"
      />  

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Company Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleSelectChange("status", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    placeholder="Add any additional notes about the company..."
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                  />
                </div>

                <CustomStepNavigation
                  currentStep={6}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("branding")}
                  onSubmit={handleSubmit}
                  submitLabel={editingCompany ? 'Update Company' : 'Save Company'}
                  isLastStep={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image viewing modal */}
     <ImagePreviewDialog viewingImage={viewingImage} onClose={() => setViewingImage(null)} />
    </div>
  );
};

export default CompanyPage;