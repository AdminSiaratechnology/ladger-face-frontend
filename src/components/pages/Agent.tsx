import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
  UserCheck,
  Target,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { Country, State, City } from 'country-state-city';
import { useAgentStore } from "../../../store/agentStore"; // Assuming a store similar to customerStore
import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";

// Interfaces (adapted from provided Agent interface)
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

interface Agent {
  id: number;
  _id?: string;
  agentType: string;
  agentCode: string;
  code: string;
  companyId: string;
  agentName: string;
  shortName: string;
  agentCategory: string;
  specialty: string;
  territory: string;
  supervisor: string;
  agentStatus: string;
  experienceLevel: string;
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
  commissionStructure: string;
  paymentTerms: string;
  commissionRate: string;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  paymentInstructions: string;
  banks: Bank[];
  approvalWorkflow: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  agentPriority: string;
  leadSource: string;
  internalNotes: string;
  logo: string | null;
  notes: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  performanceRating: number;
  activeContracts: number;
  isDeleted: boolean;
}

interface AgentForm {
  agentType: string;
  agentCode: string;
  code: string;
  companyId: string;
  agentName: string;
  shortName: string;
  agentCategory: string;
  specialty: string;
  territory: string;
  supervisor: string;
  agentStatus: string;
  experienceLevel: string;
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
  commissionStructure: string;
  paymentTerms: string;
  commissionRate: string;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  taxCategory: string;
  taxTemplate: string;
  withholdingTaxCategory: string;
  isTaxExempt: boolean;
  reverseCharge: boolean;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  swiftCode: string;
  preferredPaymentMethod: string;
  acceptedPaymentMethods: string[];
  paymentInstructions: string;
  approvalWorkflow: string;
  documentRequired: string;
  externalSystemId: string;
  crmIntegration: string;
  dataSource: string;
  agentPriority: string;
  leadSource: string;
  internalNotes: string;
  banks: Bank[];
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
  performanceRating: number;
  activeContracts: number;
}

const AgentRegistrationPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'probation'>('all');
  const [sortBy, setSortBy] = useState<'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc'>('nameAsc');
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  
  const { fetchAgents, addAgent, updateAgent, deleteAgent, agents, filterAgents, pagination, loading, error } = useAgentStore(); // Assuming store exists
  const { companies } = useCompanyStore();
  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c._id === companyId);
    return company ? company.namePrint : 'Unknown Company';
  };
    const [formData, setFormData] = useState<AgentForm>({
    agentType: 'individual',
    agentCode: '',
    code: "",
    companyId:"",
    agentName: '',
    shortName: '',
    agentCategory: '',
    specialty: '',
    territory: '',
    supervisor: '',
    agentStatus: 'active',
    experienceLevel: '',
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
    commissionStructure: '',
    paymentTerms: '',
    commissionRate: '',
    taxId: '',
    vatNumber: '',
    gstNumber: '',
    panNumber: '',
    tanNumber: '',
    taxCategory: '',
    taxTemplate: '',
    withholdingTaxCategory: '',
    isTaxExempt: false,
    reverseCharge: false,
    bankName: '',
    branchName: '',
    accountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    swiftCode: '',
    preferredPaymentMethod: '',
    acceptedPaymentMethods: [],
    paymentInstructions: '',
    approvalWorkflow: '',
    documentRequired: '',
    externalSystemId: '',
    crmIntegration: '',
    dataSource: 'manual',
    agentPriority: 'medium',
    leadSource: '',
    internalNotes: '',
    banks: [],
    notes: '',
    registrationDocs: [],
    performanceRating: 0,
    activeContracts: 0
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

  const handleSelectChange = (name: keyof AgentForm, value: string): void => {
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
      alert("Please fill in at least Account Holder Name, Account Number, and Bank Name");
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
      agentType: 'individual',
      agentCode: '',
      code: "",
      companyId: "",
      agentName: '',
      shortName: '',
      agentCategory: '',
      specialty: '',
      territory: '',
      supervisor: '',
      agentStatus: 'active',
      experienceLevel: '',
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
      commissionStructure: '',
      paymentTerms: '',
      commissionRate: '',
      taxId: '',
      vatNumber: '',
      gstNumber: '',
      panNumber: '',
      tanNumber: '',
      taxCategory: '',
      taxTemplate: '',
      withholdingTaxCategory: '',
      isTaxExempt: false,
      reverseCharge: false,
      bankName: '',
      branchName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      swiftCode: '',
      preferredPaymentMethod: '',
      acceptedPaymentMethods: [],
      paymentInstructions: '',
      approvalWorkflow: '',
      documentRequired: '',
      externalSystemId: '',
      crmIntegration: '',
      dataSource: 'manual',
      agentPriority: 'medium',
      leadSource: '',
      internalNotes: '',
      banks: [],
      notes: '',
      registrationDocs: [],
      performanceRating: 0,
      activeContracts: 0
    });
    setEditingAgent(null);
    setActiveTab("basic");
  };

  const handleEditAgent = (agent: Agent): void => {
    setEditingAgent(agent);
    setFormData({
      ...agent,
      logoPreviewUrl: agent.logo || undefined,
      registrationDocs: agent.registrationDocs.map(doc => ({
        ...doc,
        previewUrl: doc.file // Assuming file is URL or base64, adjust if needed
      }))
    });
    setOpen(true);
  };

  const handleDeleteAgent = (id: string): void => {
    deleteAgent(id);
  };

  const handleSubmit = (): void => {
    if (!formData.agentName.trim() || !formData.emailAddress.trim()) {
      alert("Please fill in Agent Name and Email Address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailAddress)) {
      alert("Please enter a valid email address");
      return;
    }

    const agentFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof AgentForm];
      
      if (key === 'registrationDocs' || key === 'banks' || key === 'logoFile' || key === 'logoPreviewUrl' || key === 'acceptedPaymentMethods') {
        return;
      }
      
      if (value !== null && value !== undefined && value !== '') {
        agentFormData.append(key, String(value));
      }
    });
    agentFormData.append("companyID",formData.companyId)
    
    agentFormData.append('banks', JSON.stringify(formData.banks));
    agentFormData.append('acceptedPaymentMethods', JSON.stringify(formData.acceptedPaymentMethods || []));
    
    if (formData.logoFile) {
      agentFormData.append('logo', formData.logoFile);
    }
    
    formData.registrationDocs.forEach((doc) => {
      agentFormData.append('registrationDocs', doc.file);
    });
    agentFormData.append('registrationDocTypes', JSON.stringify(formData.registrationDocs.map(doc => doc.type)));
    agentFormData.append('registrationDocsCount', String(formData.registrationDocs.length));

    if (editingAgent) {
      updateAgent({ id: editingAgent._id || '', agent: agentFormData });
    } else {
      addAgent(agentFormData);
    }
    // setOpen(false);
    // resetForm();
  };

  const stats = useMemo(() => ({
    totalAgents: pagination?.total,
    gstRegistered: filteredAgents.filter(c => c.gstNumber?.trim() !== "").length,
    activeAgents: statusFilter === 'active' ? pagination?.total : filteredAgents.filter(c => c.agentStatus === 'active').length,
    topPerformers: filteredAgents.filter(c => c.performanceRating >= 4).length
  }), [filteredAgents, pagination, statusFilter]);

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "commission", label: "Commission Details" },
    { id: "tax", label: "Tax Information" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" }
  ];

  // Initial fetch
  useEffect(() => {
    fetchAgents(currentPage, limit);
  }, [fetchAgents, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      filterAgents(searchTerm, statusFilter, sortBy, currentPage, limit)
        .then((result) => {
          setFilteredAgents(result);
        })
        .catch((err) => {
          console.error("Error filtering agents:", err);
        });
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterAgents]);

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Actions dropdown component
  const ActionsDropdown = ({ agent }: { agent: Agent }) => {
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
                  handleEditAgent(agent);
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
                  handleDeleteAgent(agent._id || agent.id.toString());
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
                Agent
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
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
            {filteredAgents.map((agent) => (
              <tr key={agent._id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{agent.agentName}</div>
                    <div className="text-sm text-gray-500">{agent.code}</div>
                    {agent.shortName && (
                      <div className="text-sm text-gray-500">Short: {agent.shortName}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div>Email: {agent.emailAddress}</div>
                    <div>Phone: {agent.mobileNumber}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {[agent.city, agent.state, agent.country].filter(Boolean).join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${
                    agent.agentStatus === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  } hover:bg-green-100`}>
                    {agent.agentStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown agent={agent} />
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
      {filteredAgents.map((agent: Agent) => (
        <Card key={agent._id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {agent.logo && (
                  <img src={agent.logo} alt="Agent Logo" className="w-10 h-10 rounded-full mr-3 object-cover" />
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    {agent.agentName}
                  </CardTitle>
                  {agent.shortName && (
                    <p className="text-teal-600 font-medium">{agent.shortName}</p>
                  )}
                  <p className="text-sm text-gray-500">{agent.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${agent.agentStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} hover:bg-green-100`}>
                  {agent.agentStatus}
                </Badge>
                <ActionsDropdown agent={agent} />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {agent.contactPerson && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{agent.contactPerson}</span>
                </div>
              )}
              
              {(agent.city || agent.state || agent.zipCode) && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {[agent.city, agent.state, agent.zipCode].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              {agent.mobileNumber && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{agent.mobileNumber}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600 truncate">{agent.emailAddress}</span>
              </div>
              
              {agent.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-teal-600 truncate">{agent.website}</span>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Performance</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < agent.performanceRating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-medium text-gray-500">Active Contracts</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {agent.activeContracts}
                </span>
              </div>
            </div>

            {(agent.gstNumber || agent.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {agent.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">GST</span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {agent.gstNumber}
                    </span>
                  </div>
                )}
                
                {agent.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">PAN</span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                      {agent.panNumber}
                    </span>
                  </div>
                )}
              </div>
            )}

            {agent.commissionRate && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Commission Rate</span>
                  <span className="text-xs font-semibold text-teal-700">
                    {agent.commissionRate}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
   // Pagination Controls
    const PaginationControls = () => (
      <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pagination?.limit + 1} - {Math.min(currentPage * pagination?.limit, pagination?.total)} of {pagination?.total} vendors
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
            Page {currentPage} of {pagination?.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages, prev + 1))}
            disabled={currentPage === pagination?.totalPages}
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
       
        <HeaderGradient title="Agent Management"
        subtitle="Manage your agent information and registrations"/>
        <Button 
          onClick={() => {
            resetForm();
            setOpen(true);
          }} 
          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Agents</p>
                <p className="text-3xl font-bold">{stats.totalAgents}</p>
              </div>
              <UserCheck className="w-8 h-8 text-teal-200" />
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
                <p className="text-green-100 text-sm font-medium">Active Agents</p>
                <p className="text-3xl font-bold">{stats.activeAgents}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Top Performers</p>
                <p className="text-3xl font-bold">{stats.topPerformers}</p>
              </div>
              <Target className="w-8 h-8 text-purple-200" />
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

      {pagination?.total ? (
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

      {pagination?.total === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCheck className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No agents registered yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first agent to get started</p>
            <Button 
              onClick={() => setOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              Add Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? <TableView /> : <CardView />}
          <PaginationControls />
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
          <DialogHeader className="pb-4 border-b border-gray-200 h-16">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {editingAgent ? 'Edit Agent' : 'Add New Agent'}
            </DialogTitle>
            <p className="text-gray-600 text-sm">
              {editingAgent ? 'Update the agent details' : 'Fill in the agent details and registration information'}
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
                    <UserCheck className="w-5 h-5 mr-2" />
                    Agent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.agentType}
                      onChange={(e) => handleSelectChange("agentType", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="broker">Broker</option>
                    </select>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Company *
                      </label>
                      <select
                        value={formData.companyId}
                        onChange={(e) => handleSelectChange("companyId", e.target.value)}
                        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
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

                  <div className="mt-4 flex flex-col gap-4">
                    <CustomInputBox
                      placeholder="Agent Name *"
                      name="agentName"
                      value={formData.agentName}
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
                      value={formData.agentCategory}
                      onChange={(e) => handleSelectChange("agentCategory", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Agent Category</option>
                      <option value="sales">Sales Agent</option>
                      <option value="procurement">Procurement Agent</option>
                      <option value="broker">Broker</option>
                      <option value="independent">Independent Agent</option>
                    </select>
                    
                    <select
                      value={formData.specialty}
                      onChange={(e) => handleSelectChange("specialty", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Specialty</option>
                      <option value="technology">Technology</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="realestate">Real Estate</option>
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
                      value={formData.supervisor}
                      onChange={(e) => handleSelectChange("supervisor", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Supervisor</option>
                      <option value="john">John Smith</option>
                      <option value="jane">Jane Doe</option>
                      <option value="mike">Mike Johnson</option>
                    </select>
                    
                    <select
                      value={formData.agentStatus}
                      onChange={(e) => handleSelectChange("agentStatus", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="probation">Probation</option>
                    </select>
                    
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => handleSelectChange("experienceLevel", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Experience Level</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="expert">Expert</option>
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
                    <Button onClick={() => setActiveTab("commission")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Commission Details
                    </Button>
                  </div>
                </div>
              )}

              {/* Commission Details Tab */}
              {activeTab === "commission" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Commission Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <select
                      value={formData.commissionStructure}
                      onChange={(e) => handleSelectChange("commissionStructure", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Commission Structure</option>
                      <option value="fixed">Fixed Rate</option>
                      <option value="tiered">Tiered Commission</option>
                      <option value="revenue_share">Revenue Share</option>
                      <option value="profit_share">Profit Share</option>
                    </select>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Commission Rate %"
                      name="commissionRate"
                      value={formData.commissionRate}
                      onChange={handleChange}
                      type="number"
                    />
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => handleSelectChange("paymentTerms", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Payment Terms</option>
                      <option value="net_30">Net 30</option>
                      <option value="net_60">Net 60</option>
                      <option value="immediate">Immediate</option>
                      <option value="advance">Advance Payment</option>
                    </select>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("contact")}>
                      Previous: Contact
                    </Button>
                    <Button onClick={() => setActiveTab("tax")} className="bg-teal-600 hover:bg-teal-700">
                      Next: Tax Information
                    </Button>
                  </div>
                </div>
              )}

              {/* Tax Information Tab */}
              {activeTab === "tax" && (
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Tax Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CustomInputBox
                      placeholder="Tax ID/Registration Number"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      maxLength={15}
                    />
                    <CustomInputBox
                      placeholder="VAT Number"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleChange}
                      maxLength={15}
                    />
                    <CustomInputBox
                      placeholder="GST Number"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      maxLength={15}
                    />
                    <CustomInputBox
                      placeholder="PAN Number"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    <CustomInputBox
                      placeholder="TAN Number"
                      name="tanNumber"
                      value={formData.tanNumber}
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <select
                      value={formData.taxCategory}
                      onChange={(e) => handleSelectChange("taxCategory", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Tax Category</option>
                      <option value="taxable">Taxable</option>
                      <option value="exempt">Tax Exempt</option>
                      <option value="zero_rated">Zero Rated</option>
                      <option value="out_of_scope">Out of Scope</option>
                    </select>
                    
                    <select
                      value={formData.taxTemplate}
                      onChange={(e) => handleSelectChange("taxTemplate", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select Tax Template</option>
                      <option value="standard_tax">Standard Tax</option>
                      <option value="zero_tax">Zero Tax</option>
                      <option value="igst_18">IGST 18%</option>
                      <option value="cgst_sgst_18">CGST+SGST 18%</option>
                    </select>
                    
                    <select
                      value={formData.withholdingTaxCategory}
                      onChange={(e) => handleSelectChange("withholdingTaxCategory", e.target.value)}
                      className="h-10 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-500 focus:outline-none bg-white"
                    >
                      <option value="">Select WHT Category</option>
                      <option value="tds_contractor">TDS - Contractor</option>
                      <option value="tds_professional">TDS - Professional</option>
                      <option value="tds_commission">TDS - Commission</option>
                    </select>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("commission")}>
                      Previous: Commission Details
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
                    <Button variant="outline" onClick={() => setActiveTab("tax")}>
                      Previous: Tax Information
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
                    <h4 className="font-medium text-teal-800 mb-3">Agent Logo</h4>
                    <div className="p-4 bg-white rounded-lg border border-teal-200">
                      <div className="flex items-center justify-between">
                        <input
                          type="file"
                          id="logo"
                          className="hidden"
                          onChange={handleLogoUpload}
                          accept="image/*"
                        />
                        <label
                          htmlFor="logo"
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-md cursor-pointer hover:bg-teal-100 transition-colors flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </label>
                        {formData.logoPreviewUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeLogo}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {formData.logoPreviewUrl && (
                        <div className="mt-2">
                          <img
                            src={formData.logoPreviewUrl}
                            alt="Agent Logo"
                            className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                            onClick={() => setViewingImage({previewUrl: formData.logoPreviewUrl, type: 'logo'})}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration Documents */}
                  <div className="mb-6">
                    <h4 className="font-medium text-teal-800 mb-3">Registration Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['TAX', 'VAT', 'GST', 'PAN', 'TAN'].map(docType => (
                        <div key={docType} className="p-4 bg-white rounded-lg border border-teal-200">
                          <p className="text-sm font-medium text-teal-700 mb-2">{docType} Document</p>
                          <div className="flex items-center justify-between">
                            <input
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
                            {formData.registrationDocs.find(doc => doc.type === docType) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(formData.registrationDocs.find(doc => doc.type === docType)!.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {formData.registrationDocs.find(doc => doc.type === docType) && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 truncate">
                                {formData.registrationDocs.find(doc => doc.type === docType)?.fileName}
                              </p>
                              {formData.registrationDocs.find(doc => doc.type === docType)?.previewUrl && docType !== 'PDF' && ( // Assume PDF not previewable as image
                                <img
                                  src={formData.registrationDocs.find(doc => doc.type === docType)?.previewUrl}
                                  alt={`${docType} document`}
                                  className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75 mt-2"
                                  onClick={() => setViewingImage(formData.registrationDocs.find(doc => doc.type === docType)!)}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={formData.agentPriority}
                      onChange={(e) => handleSelectChange("agentPriority", e.target.value)}
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
                      <option value="referral">Referral</option>
                      <option value="recruitment">Recruitment Agency</option>
                      <option value="direct">Direct Application</option>
                      <option value="social_media">Social Media</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isTaxExempt"
                        checked={formData.isTaxExempt}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Tax Exempt
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="reverseCharge"
                        checked={formData.reverseCharge}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Reverse Charge
                    </label>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-teal-700 mb-2">Internal Notes</p>
                    <textarea
                      placeholder="Add any additional notes about the agent..."
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
                      {editingAgent ? 'Update Agent' : 'Save Agent'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default AgentRegistrationPage;