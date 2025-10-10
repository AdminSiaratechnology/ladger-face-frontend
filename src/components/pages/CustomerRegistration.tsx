import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  Building2, 
  FileText, 
  Settings2, 
  Star, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye, 
  Table, 
  Grid3X3, 
  Layers,
  Package,
  Tag,
  Archive,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Globe,
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { Country, State, City } from 'country-state-city';
import { useCustomerStore } from "../../../store/customerStore"; // Assuming a store similar to productStore
import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import MultiStepNav  from "../customComponents/MultiStepNav"; // Assuming it's exported from vendor or a shared file
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";

// Interfaces (adapted from provided Customer interface)
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

interface RegistrationDocument {
  id: number;
  type: string;
  file: File;
  previewUrl: string;
  fileName: string;
}

interface Customer {
  id: number;
  _id?: string;
  customerType: string;
  customerCode: string;
  code: string;
  companyId:string;
  customerName: string;
  shortName: string;
  customerGroup: string;
  industryType: string;
  territory: string;
  salesPerson: string;
  customerStatus: string;
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
  priceList: string;
  paymentTerms: string;
  creditLimit: string;
  creditDays: string;
  discount: string;
  agent: string;
  isFrozenAccount: boolean;
  disabled: boolean;
  allowZeroValuation: boolean;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  msmeRegistration: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  exportCustomer: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  creditCardDetails: string;
  paymentInstructions: string;
  banks: Bank[];
  approvalWorkflow: string;
  creditLimitApprover: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  customerPriority: string;
  leadSource: string;
  internalNotes: string;
  allowPartialShipments: boolean;
  allowBackOrders: boolean;
  autoInvoice: boolean;
  logo: string | null; // Will handle as previewUrl or file
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  isDeleted: boolean;
}

interface CustomerForm {
  customerType: string;
  customerCode: string;
  code: string;
  companyId:string;
  customerName: string;
  shortName: string;
  customerGroup: string;
  industryType: string;
  territory: string;
  salesPerson: string;
  customerStatus: string;
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
  priceList: string;
  paymentTerms: string;
  creditLimit: string;
  creditDays: string;
  discount: string;
  agent: string;
  isFrozenAccount: boolean;
  disabled: boolean;
  allowZeroValuation: boolean;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  msmeRegistration: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  exportCustomer: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  creditCardDetails: string;
  paymentInstructions: string;
  approvalWorkflow: string;
  creditLimitApprover: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  customerPriority: string;
  leadSource: string;
  internalNotes: string;
  allowPartialShipments: boolean;
  allowBackOrders: boolean;
  autoInvoice: boolean;
  banks: Bank[];
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
}
const stepIcons = { basic: <Users className="w-2 h-2 md:w-5 md:h-5 " />, contact: <Phone className="w-2 h-2 md:w-5 md:h-5 " />, financialSettings: <CreditCard className="w-2 h-2 md:w-5 md:h-5 " />, tax: <FileText className="w-2 h-2 md:w-5 md:h-5 " />, bank: <Building2 className="w-2 h-2 md:w-5 md:h-5 " />, settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5 " /> };

const CustomerRegistrationPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'prospect'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { fetchCustomers, addCustomer, updateCustomer, deleteCustomer, customers, filterCustomers, pagination, loading, error } = useCustomerStore(); // Assuming store exists
  const { companies } = useCompanyStore();
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c._id === companyId);
    return company ? company.namePrint : 'Unknown Company';
  };
    const [formData, setFormData] = useState<CustomerForm>({
    customerType: 'individual',
    customerCode: '',
    code: "",
    companyId:"",
    customerName: '',
    shortName: '',
    customerGroup: '',
    industryType: '',
    territory: '',
    salesPerson: '',
    customerStatus: 'active',
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
    priceList: '',
    paymentTerms: '',
    creditLimit: '',
    creditDays: '',
    discount: '',
    agent: '',
    isFrozenAccount: false,
    disabled: false,
    allowZeroValuation: false,
    taxId: '',
    vatNumber: '',
    gstNumber: '',
    panNumber: '',
    tanNumber: '',
    taxCategory: '',
    taxTemplate: '',
    withholdingTaxCategory: '',
    msmeRegistration: '',
    isTaxExempt: false,
    reverseCharge: false,
    exportCustomer: false,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    swiftCode: '',
    preferredPaymentMethod: '',
    acceptedPaymentMethods: [],
    creditCardDetails: '',
    paymentInstructions: '',
    approvalWorkflow: '',
    creditLimitApprover: '',
    documentRequired: '',
    externalSystemId: '',
    crmIntegration: '',
    dataSource: 'manual',
    customerPriority: 'medium',
    leadSource: '',
    internalNotes: '',
    allowPartialShipments: false,
    allowBackOrders: false,
    autoInvoice: false,
    banks: [],
    notes: '',
    registrationDocs: [],
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

  const handleSelectChange = (name: keyof CustomerForm, value: string): void => {
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
      customerType: 'individual',
      customerCode: '',
      code: "",
      companyId:"",
      customerName: '',
      shortName: '',
      customerGroup: '',
      industryType: '',
      territory: '',
      salesPerson: '',
      customerStatus: 'active',
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
      priceList: '',
      paymentTerms: '',
      creditLimit: '',
      creditDays: '',
      discount: '',
      agent: '',
      isFrozenAccount: false,
      disabled: false,
      allowZeroValuation: false,
      taxId: '',
      vatNumber: '',
      gstNumber: '',
      panNumber: '',
      tanNumber: '',
      taxCategory: '',
      taxTemplate: '',
      withholdingTaxCategory: '',
      msmeRegistration: '',
      isTaxExempt: false,
      reverseCharge: false,
      exportCustomer: false,
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      swiftCode: '',
      preferredPaymentMethod: '',
      acceptedPaymentMethods: [],
      creditCardDetails: '',
      paymentInstructions: '',
      approvalWorkflow: '',
      creditLimitApprover: '',
      documentRequired: '',
      externalSystemId: '',
      crmIntegration: '',
      dataSource: 'manual',
      customerPriority: 'medium',
      leadSource: '',
      internalNotes: '',
      allowPartialShipments: false,
      allowBackOrders: false,
      autoInvoice: false,
      banks: [],
      notes: '',
      registrationDocs: [],
    });
    setEditingCustomer(null);
    setActiveTab("basic");
  };

  const handleEditCustomer = (customer: Customer): void => {
    setEditingCustomer(customer);
    setFormData({
      ...customer,
      logoPreviewUrl: customer.logo || undefined,
      registrationDocs: customer.registrationDocs.map(doc => ({
        ...doc,
        previewUrl: doc.file // Assuming file is URL or base64, adjust if needed
      }))
    });
    setOpen(true);
  };

  const handleDeleteCustomer = (id: string): void => {
    deleteCustomer(id);
  };

  const handleSubmit = (): void => {
    if (!formData.customerName.trim()) {
      toast.error("Please enter Customer Name");
      return;
    }
    if (!formData.companyId) {
      toast.error("Please select Company");
      return;
    }
    if (!formData.contactPerson.trim()) {
      toast.error("Please enter Contact Person");
      return;
    }
    if (!formData.emailAddress.trim()) {
      toast.error("Please enter Email Address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.country) {
      toast.error("Please select Country");
      return;
    }
    if (!formData.zipCode.trim()) {
      toast.error("Please enter Zip/Pincode");
      return;
    }

    const customerFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof CustomerForm];
      
      if (key === 'registrationDocs' || key === 'banks' || key === 'logoFile' || key === 'logoPreviewUrl' || key === 'acceptedPaymentMethods') {
        return;
      }
      
      if (value !== null && value !== undefined && value !== '') {
        customerFormData.append(key, String(value));
      }
    });
    customerFormData.append("companyID",formData.companyId)
    
    customerFormData.append('banks', JSON.stringify(formData.banks));
    customerFormData.append('acceptedPaymentMethods', JSON.stringify(formData.acceptedPaymentMethods || []));
    
    if (formData.logoFile) {
      customerFormData.append('logo', formData.logoFile);
    }
    
    formData.registrationDocs.forEach((doc) => {
      customerFormData.append('registrationDocs', doc.file);
    });
    customerFormData.append('registrationDocTypes', JSON.stringify(formData.registrationDocs.map(doc => doc.type)));
    customerFormData.append('registrationDocsCount', String(formData.registrationDocs.length));

    if (editingCustomer) {
      updateCustomer({ id: editingCustomer._id || '', customer: customerFormData });
    } else {
      addCustomer(customerFormData);
    }
    // setOpen(false);
    // resetForm();
  };

  const stats = useMemo(() => ({
    totalCustomers: pagination?.total,
    gstRegistered: filteredCustomers?.filter(c => c.gstNumber?.trim() !== "").length,
    msmeRegistered: filteredCustomers?.filter(c => c.msmeRegistration?.trim() !== "").length,
    activeCustomers: statusFilter === 'active' ? pagination?.total : filteredCustomers?.filter(c => c.customerStatus === 'active').length
  }), [filteredCustomers, pagination, statusFilter]);

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "financialSettings", label: "Financial Settings" },
    { id: "tax", label: "Tax Information" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" }
  ];

  // Initial fetch
  useEffect(() => {
    fetchCustomers(currentPage, limit);
  }, [fetchCustomers, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterCustomers(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredCustomers(result);
        })
        .catch((err) => {
          console.error("Error filtering customers:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterCustomers]);

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  
 const headers = ['Customer', 'Contact', 'Address', 'Status', 'Actions'];
  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
       
           <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{customer.customerName}</div>
                    <div className="text-sm text-gray-500">{customer.code}</div>
                    {customer.shortName && (
                      <div className="text-sm text-gray-500">Short: {customer.shortName}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div>Email: {customer.emailAddress}</div>
                    <div>Phone: {customer.mobileNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {[customer.city, customer.state, customer.country].filter(Boolean).join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    customer.customerStatus === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {customer.customerStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* <ActionsDropdown customer={customer} /> */}
                              <ActionsDropdown
  onEdit={() =>  handleEditCustomer(customer)}
  onDelete={() =>handleDeleteCustomer(customer._id || '')}
  module="BusinessManagement" subModule="CustomerRegistration"
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
      {filteredCustomers.map((customer: Customer) => (
        <Card key={customer._id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {customer.logo && (
                  <img src={customer.logo} alt="Customer Logo" className="w-10 h-10 rounded-full mr-3 object-cover" />
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    {customer.customerName}
                  </CardTitle>
                  {customer.shortName && (
                    <p className="text-teal-600 font-medium">{customer.shortName}</p>
                  )}
                  <p className="text-sm text-gray-500">{customer.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${customer.customerStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {customer.customerStatus}
                </Badge>
                {/* <ActionsDropdown customer={customer} /> */}
                             <ActionsDropdown
  onEdit={() =>  handleEditCustomer(customer)}
  onDelete={() =>handleDeleteCustomer(customer._id || '')}
  module="BusinessManagement" subModule="CustomerRegistration"
/>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {customer.contactPerson && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{customer.contactPerson}</span>
                </div>
              )}
              
              {(customer.city || customer.state || customer.zipCode) && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {[customer.city, customer.state, customer.zipCode].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              {customer.mobileNumber && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{customer.mobileNumber}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600 truncate">{customer.emailAddress}</span>
              </div>
              
              {customer.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-teal-600 truncate">{customer.website}</span>
                </div>
              )}
            </div>

            {(customer.gstNumber || customer.msmeRegistration || customer.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {customer.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">GST</span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {customer.gstNumber}
                    </span>
                  </div>
                )}
                
                {customer.msmeRegistration && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">MSME</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                      {customer.msmeRegistration}
                    </span>
                  </div>
                )}
                
                {customer.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">PAN</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                      {customer.panNumber}
                    </span>
                  </div>
                )}
              </div>
            )}

            {customer.banks.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Bank Accounts</p>
                <div className="space-y-2">
                  {customer.banks.slice(0, 2).map(bank => (
                    <div key={bank.id} className="text-xs bg-gray-100 p-2 rounded">
                      <p className="font-medium truncate">{bank.bankName}</p>
                      <p className="text-gray-600 truncate">A/C: ••••{bank.accountNumber.slice(-4)}</p>
                    </div>
                  ))}
                  {customer.banks.length > 2 && (
                    <p className="text-xs text-gray-500">+{customer.banks.length - 2} more</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{customer.currency}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );


  // FilterBar component
  const FilterBar = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    onClearFilters
  }: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: any) => void;
    sortBy: string;
    setSortBy: (value: any) => void;
    onClearFilters: () => void;
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white rounded-md p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 " />
          <Input
            placeholder="Search by name, email, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 border-gray-300 focus:border-teal-500 active:!ring-2 active:!ring-teal-500 !outline-0 focus:!border-none"
          />
        </div>
        <button className=" bg-black text-white px-2 rounded-sm  font-bold text-sm" onClick={onClearFilters}>Clear Fitler</button>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full md:w-auto"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
        <option value="prospect">Prospect</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="h-10 px-3 py-2 border border-gray-300 rounded-md focus:border-teal-500 focus:outline-none bg-white w-full md:w-auto"
      >
        <option value="nameAsc">Name A-Z</option>
        <option value="nameDesc">Name Z-A</option>
        <option value="dateAsc">Oldest First</option>
        <option value="dateDesc">Newest First</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        
        <HeaderGradient title="Customer Management"
        subtitle="Manage your customer information and registrations"/>
        <CheckAccess  module="BusinessManagement" subModule="CustomerRegistration" type="create">

       
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Users className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
         </CheckAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-teal-200" />
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
                <p className="text-3xl font-bold">{stats.activeCustomers}</p>
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
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No customers registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first customer to get started</p>
            <CheckAccess  module="BusinessManagement" subModule="CustomerRegistration" type="create">
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Customer
            </Button>
            </CheckAccess>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
         
               <PaginationControls
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
        itemName="Customers"
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
        <DialogContent className="sm:max-w-full flex flex-col sm:w-[75vw] max-h-[80vh] min-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl">
          <CustomFormDialogHeader
            title={editingCustomer ? "Edit Customer" : "Add New Customer"}
            subtitle={
              editingCustomer
                ? "Update the customer details"
                : "Complete customer registration information"
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
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Customer Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => handleSelectChange("customerType", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.companyId}
                      onChange={(e) => handleSelectChange("companyId", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.namePrint}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Customer Name *"
                    placeholder="e.g., ABC Suppliers"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Short Name"
                    placeholder="e.g., ABC"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Customer Group</label>
                    <select
                      value={formData.customerGroup}
                      onChange={(e) => handleSelectChange("customerGroup", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Customer Group</option>
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="distributor">Distributor</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Industry Type</label>
                    <select
                      value={formData.industryType}
                      onChange={(e) => handleSelectChange("industryType", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Industry Type</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="services">Services</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="technology">Technology</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Territory</label>
                    <select
                      value={formData.territory}
                      onChange={(e) => handleSelectChange("territory", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Territory</option>
                      <option value="north">North</option>
                      <option value="south">South</option>
                      <option value="east">East</option>
                      <option value="west">West</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Sales Person</label>
                    <select
                      value={formData.salesPerson}
                      onChange={(e) => handleSelectChange("salesPerson", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Sales Person</option>
                      <option value="john">John Smith</option>
                      <option value="jane">Jane Doe</option>
                      <option value="mike">Mike Johnson</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Customer Status</label>
                    <select
                      value={formData.customerStatus}
                      onChange={(e) => handleSelectChange("customerStatus", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="prospect">Prospect</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleSelectChange("companySize", e.target.value)}
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Company Size</option>
                      <option value="small">Small (1-50)</option>
                      <option value="medium">Medium (51-250)</option>
                      <option value="large">Large (251-1000)</option>
                      <option value="enterprise">Enterprise (1000+)</option>
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
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <CustomInputBox
                    label="Contact Person *"
                    placeholder="e.g., John Doe"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Designation"
                    placeholder="e.g., Manager"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInputBox
                      label="Phone Number"
                      placeholder="e.g., +1-234-567-8900"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      label="Mobile Number"
                      placeholder="e.g., +1-234-567-8900"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <CustomInputBox
                    label="Email Address *"
                    placeholder="e.g., john@example.com"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    type="email"
                    required={true}
                  />
                  <CustomInputBox
                    label="Fax Number"
                    placeholder="e.g., +1-234-567-8900"
                    name="faxNumber"
                    value={formData.faxNumber}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Address Line 1"
                    placeholder="e.g., 123 Main St"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label="Address Line 2"
                    placeholder="e.g., Apt 4B"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <CustomInputBox
                    label="Zip/Pincode *"
                    placeholder="e.g., 12345"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength={10}
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
  onNext={() => setActiveTab("financialSettings")}
/>
              </div>
            )}

              {activeTab === "financialSettings" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Financial Settings</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleSelectChange("currency", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Price List</label>
                      <select
                        value={formData.priceList}
                        onChange={(e) => handleSelectChange("priceList", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Price List</option>
                        <option value="standard">Standard Pricing</option>
                        <option value="wholesale">Wholesale Pricing</option>
                        <option value="vip">VIP Pricing</option>
                        <option value="promotional">Promotional Pricing</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CustomInputBox
                      label="Credit Limit"
                      placeholder="e.g., 10000"
                      name="creditLimit"
                      value={formData.creditLimit}
                      onChange={handleChange}
                      type="number"
                    />
                    <CustomInputBox
                      label="Credit Days"
                      placeholder="e.g., 30"
                      name="creditDays"
                      value={formData.creditDays}
                      onChange={handleChange}
                      type="number"
                    />
                    <CustomInputBox
                      label="Discount %"
                      placeholder="e.g., 5"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      type="number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Payment Terms</label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => handleSelectChange("paymentTerms", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Payment Terms</option>
                        <option value="net_30">Net 30</option>
                        <option value="net_60">Net 60</option>
                        <option value="immediate">Immediate</option>
                        <option value="advance">Advance Payment</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Agent</label>
                      <select
                        value={formData.agent}
                        onChange={(e) => handleSelectChange("agent", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Agent</option>
                        <option value="sales">Sales Department</option>
                        <option value="marketing">Marketing Department</option>
                        <option value="operations">Operations</option>
                      </select>
                    </div>
                  </div>
                  
                  <CustomStepNavigation
  currentStep={3}
  totalSteps={6}
  onPrevious={() => setActiveTab("contact")}
  onNext={() => setActiveTab("tax")}
/>
                </div>
              )}

              {activeTab === "tax" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Tax Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CustomInputBox
                      label="Tax ID/Registration Number"
                      placeholder="e.g., 1234567890"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      maxLength={15}
                    />
                    <CustomInputBox
                      label="VAT Number"
                      placeholder="e.g., VAT123456"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleChange}
                      maxLength={15}
                    />
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
                      name="msmeRegistration"
                      value={formData.msmeRegistration}
                      onChange={handleChange}
                      maxLength={20}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Tax Category</label>
                      <select
                        value={formData.taxCategory}
                        onChange={(e) => handleSelectChange("taxCategory", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Tax Category</option>
                        <option value="taxable">Taxable</option>
                        <option value="exempt">Tax Exempt</option>
                        <option value="zero_rated">Zero Rated</option>
                        <option value="out_of_scope">Out of Scope</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Tax Template</label>
                      <select
                        value={formData.taxTemplate}
                        onChange={(e) => handleSelectChange("taxTemplate", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Tax Template</option>
                        <option value="standard_tax">Standard Tax</option>
                        <option value="zero_tax">Zero Tax</option>
                        <option value="igst_18">IGST 18%</option>
                        <option value="cgst_sgst_18">CGST+SGST 18%</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Withholding Tax Category</label>
                      <select
                        value={formData.withholdingTaxCategory}
                        onChange={(e) => handleSelectChange("withholdingTaxCategory", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select WHT Category</option>
                        <option value="tds_contractor">TDS - Contractor</option>
                        <option value="tds_professional">TDS - Professional</option>
                        <option value="tds_commission">TDS - Commission</option>
                      </select>
                    </div>
                  </div>

                  <CustomStepNavigation
  currentStep={4}
  totalSteps={6}
  onPrevious={() => setActiveTab("financialSettings")}
  onNext={() => setActiveTab("bank")}
/>
                </div>
              )}

              {activeTab === "bank" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Bank Details</h3>
                  </div>
                  
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
  currentStep={5}
  totalSteps={6}
  onPrevious={() => setActiveTab("tax")}
  onNext={() => setActiveTab("settings")}
/>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Settings2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Additional Settings</h3>
                  </div>
                  
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">Customer Logo</h4>
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
                            alt="Customer Logo"
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
                      {['TAX', 'VAT', 'GST', 'PAN', 'TAN', 'MSME'].map(docType => (
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

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Customer Priority</label>
                      <select
                        value={formData.customerPriority}
                        onChange={(e) => handleSelectChange("customerPriority", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Lead Source</label>
                      <select
                        value={formData.leadSource}
                        onChange={(e) => handleSelectChange("leadSource", e.target.value)}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        <option value="">Select Lead Source</option>
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="advertising">Advertising</option>
                        <option value="social_media">Social Media</option>
                        <option value="cold_call">Cold Call</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFrozenAccount"
                        checked={formData.isFrozenAccount}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                      />
                      Frozen Account
                    </label>
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="disabled"
                        checked={formData.disabled}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                      />
                      Disabled
                    </label>
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="allowZeroValuation"
                        checked={formData.allowZeroValuation}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                      />
                      Allow Zero Valuation
                    </label>
                    <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isTaxExempt"
                        checked={formData.isTaxExempt}
                        onChange={handleChange}
                        className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                      />
                      Tax Exempt
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</p>
                    <textarea
                      placeholder="Add any additional notes about the customer..."
                      name="internalNotes"
                      value={formData.internalNotes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                    />
                  </div>

                  <CustomStepNavigation
  currentStep={6}
  totalSteps={6}
  onPrevious={() => setActiveTab("bank")}
  onSubmit={handleSubmit}
  submitLabel={editingCustomer ? 'Update Customer' : 'Save Customer'}
  isLastStep={true}
/>
                </div>
              )}
            </div>
          {/* </div> */}
        </DialogContent>
      </Dialog>

      {/* Image viewing modal */}
      {viewingImage && (
        <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{viewingImage.type} {viewingImage.type === 'logo' ? 'Logo' : 'Document'}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={viewingImage.previewUrl}
                alt={`${viewingImage.type}`}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerRegistrationPage;