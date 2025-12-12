import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Users,
  Building2,
  FileText,
  Settings2,
  Star,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Globe,
  Plus,
  Upload,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle,
  UserCheck,
  Target,
  File,
  Edit,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { Country, State, City } from "country-state-city";
import { useAgentStore } from "../../../store/agentStore";
import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import MultiStepNav from "../customComponents/MultiStepNav";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import TableHeader from "../customComponents/CustomTableHeader";

import EmptyStateCard from "../customComponents/EmptyStateCard";
import ImagePreviewDialog from "../customComponents/ImagePreviewDialog";
import SelectedCompany from "../customComponents/SelectedCompany";
import UniversalDetailsModal from "../customComponents/UniversalDetailsModal";
import imageCompression from "browser-image-compression";

const stepIcons = {
  basic: <Users className="w-2 h-2 md:w-5 md:h-5" />,
  contact: <Phone className="w-2 h-2 md:w-5 md:h-5" />,
  commission: <CreditCard className="w-2 h-2 md:w-5 md:h-5" />,
  tax: <FileText className="w-2 h-2 md:w-5 md:h-5" />,
  bank: <Building2 className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

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
  status: string;
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
  status: string;
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
  logoFile?: File;
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
  performanceRating: number;
  activeContracts: number;
}
const compressionOptions = {
  maxSizeMB: 1, // Max file size after compression_
  maxWidthOrHeight: 1920, // Max dimension_
  useWebWorker: true, // Use web worker for non-blocking_
  initialQuality: 0.8, // Start with 80% quality_
};

const AgentRegistrationPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
    branch: "",
  });
  const [viewingImage, setViewingImage] = useState<
    RegistrationDocument | { previewUrl: string; type: "logo" } | null
  >(null);
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleViewAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  };
  const limit = 12;

  const {
    fetchAgents,
    addAgent,
    updateAgent,
    deleteAgent,
    agents,
    filterAgents,
    pagination,
    counts,
    loading,
    initialLoading,
  } = useAgentStore(); // Assuming the store is implemented
  const { companies, defaultSelected } = useCompanyStore();

  // Sync filteredAgents with agents from store
  useEffect(() => {
    setFilteredAgents(agents);
  }, [agents]);

  // Initial fetch
  // useEffect(() => {
  //   fetchAgents(currentPage, limit, defaultSelected?._id);
  // }, [fetchAgents, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        filterAgents(
          searchTerm,
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        )
          .then((result) => {
            setFilteredAgents(result);
          })
          .catch((err) => {
            console.error("Error filtering agents:", err);
          });
      } else if (searchTerm.length === 0) {
        filterAgents(
          "",
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        );
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, statusFilter, sortBy, currentPage, filterAgents]);

  const [formData, setFormData] = useState<AgentForm>({
    agentType: "individual",
    agentCode: "",
    code: "",
    companyId: "",
    agentName: "",
    shortName: "",
    agentCategory: "",
    specialty: "",
    territory: "",
    supervisor: "",
    agentStatus: "active",
    status: "active",
    experienceLevel: "",
    contactPerson: "",
    designation: "",
    phoneNumber: "",
    mobileNumber: "",
    emailAddress: "",
    faxNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    website: "",
    currency: "INR",
    commissionStructure: "",
    paymentTerms: "",
    commissionRate: "",
    taxId: "",
    vatNumber: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    taxCategory: "",
    taxTemplate: "",
    withholdingTaxCategory: "",
    isTaxExempt: false,
    msmeRegistration: "",
    reverseCharge: false,
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    swiftCode: "",
    preferredPaymentMethod: "",
    acceptedPaymentMethods: [],
    paymentInstructions: "",
    approvalWorkflow: "",
    documentRequired: "",
    externalSystemId: "",
    crmIntegration: "",
    dataSource: "manual",
    agentPriority: "medium",
    leadSource: "",
    internalNotes: "",
    banks: [],
    notes: "",
    registrationDocs: [],
    performanceRating: 0,
    activeContracts: 0,
  });
  const [isAccountHolderManuallyEdited, setIsAccountHolderManuallyEdited] =
    useState(false);
  useEffect(() => {
    if (!isAccountHolderManuallyEdited && formData.agentName) {
      setBankForm((prev) => ({
        ...prev,
        accountHolderName: formData.agentName,
      }));
    }
  }, [formData.agentName, isAccountHolderManuallyEdited]);
  useEffect(() => {
    if (defaultSelected && companies.length > 0) {
      const selectedCompany = defaultSelected;
      if (selectedCompany) {
        // 🧩 Derive the currency from the company's country
        const derivedCurrency = getCurrencyForCountry(selectedCompany.country);

        setFormData((prev) => ({
          ...prev,
          companyId: selectedCompany._id,
          country: selectedCompany.country || prev.country,
          state: selectedCompany.state || prev.state,
          city: selectedCompany.city || prev.city,
          currency: derivedCurrency,
        }));
      }
    }
  }, [defaultSelected]);
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const availableStates = useMemo(() => {
    const selectedCountry = allCountries.find(
      (c) => c.name === formData.country
    );
    if (!selectedCountry) return [];
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [formData.country, allCountries]);

  const availableCities = useMemo(() => {
    const selectedCountry = allCountries.find(
      (c) => c.name === formData.country
    );
    const selectedState = availableStates.find(
      (s) => s.name === formData.state
    );
    if (!selectedCountry || !selectedState) return [];
    return City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode
    );
  }, [formData.country, formData.state, availableStates, allCountries]);

  const getCurrencyForCountry = (countryName: string): string => {
    const country = allCountries.find((c) => c.name === countryName);
    if (!country) return "INR";

    const currencyMap: Record<string, string> = {
      IN: "INR",
      US: "USD",
      GB: "GBP",
      CA: "CAD",
      AU: "AUD",
      DE: "EUR",
      FR: "EUR",
      JP: "JPY",
      CN: "CNY",
    };

    return currencyMap[country.isoCode] || country.currency || "USD";
  };
  useEffect(() => {
    if (formData.country) {
      const derivedCurrency = getCurrencyForCountry(formData.country);
      setFormData((prev) => ({
        ...prev,
        currency: derivedCurrency,
      }));
    }
  }, [formData.country]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: keyof AgentForm, value: string): void => {
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
        currency: getCurrencyForCountry(value),
      }));
    } else if (name === "state") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        city: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "accountNumber") {
      newValue = value.replace(/\D/g, "");
    }

    setBankForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if (name === "accountHolderName") {
      setIsAccountHolderManuallyEdited(true);
    }
  };

  const addOrUpdateBank = (): void => {
    if (
      !bankForm.accountHolderName ||
      !bankForm.accountNumber ||
      !bankForm.bankName
    ) {
      toast.error(
        "Please fill in at least Account Holder Name, Account Number, and Bank Name"
      );
      return;
    }

    if (editingBankId !== null) {
      // Update existing bank
      setFormData((prev) => ({
        ...prev,
        banks: prev.banks.map((bank) =>
          bank.id === editingBankId ? { ...bankForm, id: editingBankId } : bank
        ),
      }));
      toast.success("Bank updated successfully");
    } else {
      // Add new bank
      setFormData((prev) => ({
        ...prev,
        banks: [...prev.banks, { ...bankForm, id: Date.now() }],
      }));
      toast.success("Bank added successfully");
    }

    // Reset form
    setBankForm({
      id: Date.now(),
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      swiftCode: "",
      micrNumber: "",
      bankName: "",
      branch: "",
    });
    setEditingBankId(null);
  };

  const editBank = (bank: Bank): void => {
    setBankForm(bank);
    setEditingBankId(bank.id);
  };
  const removeBank = (id: number): void => {
    setFormData((prev) => ({
      ...prev,
      banks: prev.banks.filter((bank) => bank.id !== id),
    }));
    if (editingBankId === id) {
      setEditingBankId(null);
      // Reset bankForm if editing the removed one
      setBankForm({
        id: Date.now(),
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        swiftCode: "",
        micrNumber: "",
        bankName: "",
        branch: "",
      });
    }
  };

  // Updated logo upload with compression (async)_
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      // Skip compression for non-images (e.g., PDFs, but logo is image-only)_
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file for the logo.");
        return;
      }

      try {
        toast.info("Compressing image...");
        const compressedFile = await imageCompression(file, compressionOptions);
        const previewUrl = URL.createObjectURL(compressedFile);
        setFormData((prev) => ({
          ...prev,
          logoFile: compressedFile,
          logoPreviewUrl: previewUrl,
        }));
        toast.success(
          `Logo compressed from ${Math.round(
            file.size / 1024
          )}KB to ${Math.round(compressedFile.size / 1024)}KB`
        );
      } catch (error) {
        console.error("Compression failed:", error);
        toast.error("Failed to compress image. Using original file.");
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          logoFile: file,
          logoPreviewUrl: previewUrl,
        }));
      }
    }
  };

  const removeLogo = (): void => {
    if (
      formData.logoPreviewUrl &&
      formData.logoPreviewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    setFormData((prev) => ({
      ...prev,
      logoFile: undefined,
      logoPreviewUrl: undefined,
    }));
  };

  // Updated document upload with compression (async)_
  const handleDocumentUpload = async (
    type: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress only if it's an image; skip for PDFs_
      let processedFile = file;
      let isImage = file.type.startsWith("image/");

      if (isImage) {
        try {
          toast.info(`Compressing ${type} image...`);
          processedFile = await imageCompression(file, compressionOptions);
          toast.success(
            `${type} compressed from ${Math.round(
              file.size / 1024
            )}KB to ${Math.round(processedFile.size / 1024)}KB`
          );
        } catch (error) {
          console.error("Compression failed:", error);
          toast.error(`Failed to compress ${type} image. Using original.`);
        }
      }

      const previewUrl = URL.createObjectURL(processedFile);

      const newDoc: RegistrationDocument = {
        id: Date.now(),
        type,
        file: processedFile,
        previewUrl,
        fileName: processedFile.name,
      };

      setFormData((prev) => ({
        ...prev,
        registrationDocs: [
          ...prev.registrationDocs.filter((doc) => doc.type !== type),
          newDoc,
        ],
      }));
    }
  };

  const removeDocument = (id: number) => {
    const docToRemove = formData.registrationDocs.find((doc) => doc.id === id);
    if (
      docToRemove &&
      docToRemove.previewUrl &&
      docToRemove.previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(docToRemove.previewUrl);
    }

    setFormData((prev) => ({
      ...prev,
      registrationDocs: prev.registrationDocs.filter((doc) => doc.id !== id),
    }));
  };

  const cleanupImageUrls = (): void => {
    if (
      formData.logoPreviewUrl &&
      formData.logoPreviewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }
    formData.registrationDocs.forEach((doc) => {
      if (doc.previewUrl && doc.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  };

  const resetForm = () => {
    cleanupImageUrls();
    setFormData({
      agentType: "individual",
      agentCode: "",
      code: "",
      companyId: "",
      agentName: "",
      shortName: "",
      agentCategory: "",
      specialty: "",
      territory: "",
      supervisor: "",
      agentStatus: "active",
      status: "active",
      experienceLevel: "",
      contactPerson: "",
      designation: "",
      phoneNumber: "",
      mobileNumber: "",
      emailAddress: "",
      faxNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
      website: "",
      currency: "INR",
      commissionStructure: "",
      paymentTerms: "",
      commissionRate: "",
      taxId: "",
      vatNumber: "",
      gstNumber: "",
      panNumber: "",
      tanNumber: "",
      taxCategory: "",
      taxTemplate: "",
      msmeRegistration: "",
      withholdingTaxCategory: "",
      isTaxExempt: false,
      reverseCharge: false,
      bankName: "",
      branchName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      swiftCode: "",
      preferredPaymentMethod: "",
      acceptedPaymentMethods: [],
      paymentInstructions: "",
      approvalWorkflow: "",
      documentRequired: "",
      externalSystemId: "",
      crmIntegration: "",
      dataSource: "manual",
      agentPriority: "medium",
      leadSource: "",
      internalNotes: "",
      banks: [],
      notes: "",
      registrationDocs: [],
      performanceRating: 0,
      activeContracts: 0,
    });
    setEditingAgent(null);
    setActiveTab("basic");
    setEditingBankId(null);
    setBankForm({
      id: Date.now(),
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      swiftCode: "",
      micrNumber: "",
      bankName: "",
      branch: "",
    });
  };

  const handleEditAgent = (agent: Agent): void => {
    setEditingAgent(agent);
    setFormData({
      ...agent,
      logoPreviewUrl: agent.logo || undefined,
      registrationDocs: agent.registrationDocs.map((doc, index) => ({
        id: Date.now() + index,
        type: doc.type,
        file: null, // No File for existing
        fileName: doc.fileName,
        previewUrl: doc.file, // Use URL as preview for existing images
      })),
    });
    setOpen(true);
  };

  const handleDeleteAgent = async (id: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    const willGoBack = filteredAgents.length === 1 && currentPage > 1;
    if (willGoBack) {
      setCurrentPage((prev) => prev - 1);
    }

    try {
      await deleteAgent(id);
      toast.success("Agent deleted successfully");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
      // Revert page if needed
      if (willGoBack) {
        setCurrentPage(currentPage);
      }
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.agentName.trim()) {
      toast.error("Please enter Agent Name");
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

    const agentFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof AgentForm];
      if (
        key === "registrationDocs" ||
        key === "banks" ||
        key === "logoFile" ||
        key === "logoPreviewUrl" ||
        key === "acceptedPaymentMethods"
      )
        return;
      if (value !== null && value !== undefined && value !== "") {
        agentFormData.append(key, String(value));
      }
    });
    agentFormData.append("companyID", formData.companyId);
    agentFormData.append("banks", JSON.stringify(formData.banks));
    agentFormData.append(
      "acceptedPaymentMethods",
      JSON.stringify(formData.acceptedPaymentMethods || [])
    );
    if (formData.logoFile) {
      agentFormData.append("logo", formData.logoFile);
    }
    // formData.registrationDocs.forEach((doc) => {
    //   agentFormData.append("registrationDocs", doc.file);
    // });
    //   const newRegistrationDocs = formData.registrationDocs.filter(
    //   (doc) => doc.file && doc.file instanceof Blob
    // );

    // newRegistrationDocs.forEach((doc) => {
    //   companyFormData.append("registrationDocs", doc.file!);
    // });
    // agentFormData.append(
    //   "registrationDocTypes",
    //   JSON.stringify(formData.registrationDocs.map((doc) => doc.type))
    // );
    // agentFormData.append(
    //   "registrationDocsCount",
    //   String(formData.registrationDocs.length)
    // );
    const newRegistrationDocs = formData.registrationDocs.filter(
      (doc) => doc.file && doc.file instanceof Blob
    );

    newRegistrationDocs.forEach((doc) => {
      agentFormData.append("registrationDocs", doc.file!);
    });

    if (newRegistrationDocs.length > 0) {
      agentFormData.append(
        "registrationDocTypes",
        JSON.stringify(newRegistrationDocs.map((doc) => doc.type))
      );
    }

    try {
      if (editingAgent) {
        await updateAgent({ id: editingAgent._id || "", agent: agentFormData });
        toast.success("Agent updated successfully");
      } else {
        await addAgent(agentFormData);
        fetchAgents(currentPage, limit, defaultSelected?._id);
        toast.success("Agent added successfully");
        setCurrentPage(1);
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error(
        editingAgent ? "Failed to update agent" : "Failed to add agent"
      );
    }
  };

  const stats = useMemo(
    () => ({
      totalAgents: pagination?.total || 0,
      gstRegistered: counts?.gstRegistered,
      activeAgents: counts?.activeAgents,
      msmeRegistered: counts?.msmeRegistered,
      vatRegistered: counts?.vatRegistered,
    }),
    [filteredAgents, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "commission", label: "Commission Details" },
    { id: "tax", label: "Tax Information" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" },
  ];
  const headers = ["Agent", "Contact", "Address", "Status", "Actions"];
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAgents.map((agent) => (
              <tr
                key={agent._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCheck className="h-10 w-10 text-teal-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {agent.agentName}
                      </div>
                      <div className="text-sm text-teal-600">{agent.code}</div>
                      {agent.shortName && (
                        <div className="text-xs text-gray-500">
                          Short: {agent.shortName}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <Mail className="w-3 h-3 text-gray-400 mr-2" />
                      <span className="truncate max-w-48">
                        {agent.emailAddress}
                      </span>
                    </div>
                    {agent.mobileNumber && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-gray-400 mr-2" />
                        <span>{agent.mobileNumber}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-2" />
                      <span>
                        {[agent.city, agent.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-48">
                      {agent.addressLine1}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      agent.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    } hover:bg-current`}
                  >
                    {agent.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown
                    onView={() => handleViewAgent(agent)}
                    onEdit={() => handleEditAgent(agent)}
                    onDelete={() => handleDeleteAgent(agent._id || "")}
                    module="BusinessManagement"
                    subModule="Agent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {filteredAgents.map((agent: Agent) => (
        <Card
          key={agent._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {agent.logo && (
                  <img
                    src={agent.logo}
                    alt="Agent Logo"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    {agent.agentName}
                  </CardTitle>
                  {agent.shortName && (
                    <p className="text-teal-600 font-medium">
                      {agent.shortName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{agent.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    agent.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-current`}
                >
                  {agent.status}
                </Badge>
                <CheckAccess
                  module="BusinessManagement"
                  subModule="Agent"
                  type="update"
                >
                  <ActionsDropdown
                    onView={() => handleViewAgent(agent)}
                    onEdit={() => handleEditAgent(agent)}
                    onDelete={() => handleDeleteAgent(agent._id || "")}
                    module="BusinessManagement"
                    subModule="Agent"
                  />
                </CheckAccess>
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
                    {[agent.city, agent.state, agent.zipCode]
                      .filter(Boolean)
                      .join(", ")}
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
                <span className="text-gray-600 truncate">
                  {agent.emailAddress}
                </span>
              </div>
              {agent.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-teal-600 truncate">
                    {agent.website}
                  </span>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">
                  Performance
                </span>
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
                <span className="text-xs font-medium text-gray-500">
                  Active Contracts
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {agent.activeContracts}
                </span>
              </div>
            </div>
            {(agent.gstNumber || agent.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {agent.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      GST
                    </span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {agent.gstNumber}
                    </span>
                  </div>
                )}
                {agent.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      PAN
                    </span>
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
                  <span className="text-xs font-medium text-gray-500">
                    Commission Rate
                  </span>
                  <span className="text-xs font-semibold text-teal-700">
                    {agent.commissionRate}%
                  </span>
                </div>
              </div>
            )}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Created: {new Date(agent.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  useEffect(() => {
    return () => {
      initialLoading();
    };
  }, []);
  return (
    <div className="custom-container">
      <div className="flex justify-between items-center mb-4">
        <HeaderGradient
          title="Agent Management"
          subtitle="Manage your agent information and registrations"
        />
        <CheckAccess
          module="BusinessManagement"
          subModule="Agent"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              if (defaultSelected) {
                setFormData((prev) => ({
                  ...prev,
                  companyId: defaultSelected?._id,
                  country: defaultSelected.country,
                  currency: defaultSelected.defaultCurrency,
                  state: defaultSelected.state,
                }));
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Add Agent
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Agents
                </p>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
              </div>
              <UserCheck className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        {defaultSelected.country === "India" && (
          <>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      GST Registered
                    </p>
                    <p className="text-2xl font-bold">{stats.gstRegistered}</p>
                  </div>
                  <FileText className="w-6 h-6 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      MSME Registered
                    </p>
                    <p className="text-2xl font-bold">{stats.msmeRegistered}</p>
                  </div>
                  <Target className="w-6 h-6 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {defaultSelected.country !== "India" && (
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    VAT Registered
                  </p>
                  <p className="text-2xl font-bold">{stats.vatRegistered}</p>
                </div>
                <FileText className="w-6 h-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  Active Agents
                </p>
                <p className="text-2xl font-bold">{stats.activeAgents}</p>
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
          setSearchTerm("");
          setStatusFilter("all");
          setSortBy("nameAsc");
          setCurrentPage(1);
        }}
      />
      {loading && <TableViewSkeleton />}

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={pagination?.total}
      />

      {pagination.total === 0 ? (
        <EmptyStateCard
          icon={UserCheck}
          title="No agents registered yet"
          description="Create your first agent to get started"
          buttonLabel="Add Your First Agent"
          module="BusinessManagement"
          subModule="Agent"
          type="create"
          onButtonClick={() => setOpen(true)}
        />
      ) : (
        <>
          {viewMode === "table" ? <TableView /> : <CardView />}
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            pagination={pagination}
            itemName="agents"
          />
        </>
      )}

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            resetForm();
          }
        }}
      >
        <DialogContent className="custom-dialog-container">
          <CustomFormDialogHeader
            title={editingAgent ? "Edit Agent" : "Add New Agent"}
            subtitle={
              editingAgent
                ? "Update the agent details"
                : "Complete agent registration information"
            }
          />

          <MultiStepNav
            steps={tabs}
            currentStep={activeTab}
            onStepChange={(nextTab) => {
              const stepOrder = [
                "basic",
                "contact",
                "commission",
                "tax",
                "bank",
                "settings",
              ];
              const currentIndex = stepOrder.indexOf(activeTab);
              const nextIndex = stepOrder.indexOf(nextTab);

              if (nextIndex < currentIndex) {
                setActiveTab(nextTab);
              }
              if (activeTab === "basic") {
                if (!formData.agentName) {
                  toast.error("Please fill in the required fields.");
                  return;
                }
              }
              if (activeTab === "contact") {
                if (!formData.contactPerson || !formData.emailAddress) {
                  toast.error("Please fill in the required fields.");
                  return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.emailAddress)) {
                  toast.error("Please enter a valid email address");
                  return;
                }
              }
              if (nextTab !== "contact" && nextTab !== "basic") {
                if (!formData.contactPerson) {
                  toast.error("Contact Person is required");
                  return;
                }
                if (!formData.emailAddress) {
                  toast.error("Email is required");
                  return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.emailAddress)) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                if (!formData.agentName) {
                  toast.error("Agent Name is required");
                  return;
                }
              }
              setActiveTab(nextTab);
            }}
            stepIcons={stepIcons}
            scrollContainerRef={containerRef}
          />

          <div className="flex-1 overflow-y-auto" ref={containerRef}>
            {activeTab === "basic" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Agent Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.agentType}
                      onChange={(e) =>
                        handleSelectChange("agentType", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="broker">Broker</option>
                    </select>
                  </div>
                  <CustomInputBox
                    label="Agent Name"
                    placeholder="e.g., ABC Agents"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleChange}
                    required={true}
                  />
                  <SelectedCompany />
                  <CustomInputBox
                    label="Short Name"
                    placeholder="e.g., ABC"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <CustomInputBox
                    label="Supervisor"
                    placeholder="Supervisor"
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                  />
                  <CustomInputBox
                    label=" Agent Category"
                    placeholder="agentCategory"
                    name="agentCategory"
                    value={formData.agentCategory}
                    onChange={handleChange}
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Experience Level
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        handleSelectChange("experienceLevel", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Experience Level</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Agent Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleSelectChange("status", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={6}
                  showPrevious={false}
                  onNext={() => {
                    if (!formData.agentName) {
                      toast.error("Please fill agent name.");
                      return;
                    }
                    setActiveTab("contact");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "contact" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 gap-6">
                  <CustomInputBox
                    label="Contact Person"
                    placeholder="e.g., John Doe"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Designation"
                    placeholder="e.g., Sales Manager"
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
                    label="Email Address"
                    placeholder="e.g., john.doe@example.com"
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
                      <label className="text-sm font-semibold text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country || ""}
                        disabled
                        className="h-11 px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state || ""}
                        disabled
                        className="h-11 px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        City
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) =>
                          handleSelectChange("city", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                        disabled={availableCities.length === 0}
                      >
                        <option value="">Select City</option>
                        {availableCities.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <CustomInputBox
                    label="Zip/Pincode"
                    placeholder="e.g., 12345"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    maxLength={10}
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
                  onNext={() => {
                    if (!formData.contactPerson || !formData.emailAddress) {
                      toast.error(
                        "Please enter contact person and email address."
                      );
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(formData.emailAddress)) {
                      toast.error("Please enter a valid email address");
                      return;
                    }
                    setActiveTab("commission");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
            {activeTab === "commission" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={formData.currency || ""}
                      disabled
                      className="h-11 px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Commission Structure
                    </label>
                    <select
                      value={formData.commissionStructure}
                      onChange={(e) =>
                        handleSelectChange(
                          "commissionStructure",
                          e.target.value
                        )
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Commission Structure</option>
                      <option value="fixed">Fixed Rate</option>
                      <option value="tiered">Tiered Commission</option>
                      <option value="revenue_share">Revenue Share</option>
                      <option value="profit_share">Profit Share</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>

                {/* Other fields — disabled if 'none' selected */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Commission Rate (%)"
                    placeholder="e.g., 5"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    type="number"
                    disabled={formData.commissionStructure === "none"}
                  />

                  <CustomInputBox
                    label="Payment Terms"
                    placeholder="e.g., 30 days"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                  />
                </div>

                <CustomStepNavigation
                  currentStep={3}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("contact")}
                  onNext={() => setActiveTab("tax")}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "tax" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {formData.country?.toLowerCase() === "india" ? (
                  <>
                    {/* India-specific fields (no VAT or TAN) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <CustomInputBox
                        label="Tax ID/Registration Number"
                        placeholder="e.g., 1234567890"
                        name="taxId"
                        value={formData.taxId}
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
                        label="MSME Number"
                        placeholder="e.g., MSME-XX-00-0000000"
                        name="msmeRegistration"
                        value={formData.msmeRegistration}
                        onChange={handleChange}
                        maxLength={20}
                      />
                      <CustomInputBox
                        label="TAN Number"
                        placeholder="e.g., ABCD12345E"
                        name="tanNumber"
                        value={formData.tanNumber}
                        onChange={handleChange}
                        maxLength={10}
                      />

                      {/* Tax Category beside TAN */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-gray-700">
                          Tax Category
                        </label>
                        <select
                          value={formData.taxCategory}
                          onChange={(e) =>
                            handleSelectChange("taxCategory", e.target.value)
                          }
                          className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                        >
                          <option value="">Select Tax Category</option>
                          <option value="taxable">Taxable</option>
                          <option value="exempt">Tax Exempt</option>
                          <option value="zero_rated">Zero Rated</option>
                          <option value="out_of_scope">Out of Scope</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Non-India fields (only VAT and TAN) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <CustomInputBox
                        label="VAT Number"
                        placeholder="e.g., VAT123456"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleChange}
                        maxLength={15}
                      />
                    </div>
                  </>
                )}

                <CustomStepNavigation
                  currentStep={4}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("financialSettings")}
                  onNext={() => setActiveTab("bank")}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
            {activeTab === "bank" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-white rounded-lg border-2 border-gray-200 shadow-inner">
                  <CustomInputBox
                    label="Account Holder Name"
                    placeholder="e.g., John Doe"
                    name="accountHolderName"
                    value={bankForm.accountHolderName}
                    onChange={handleBankChange}
                    required={true}
                  />
                  <CustomInputBox
                    label="Account Number"
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
                    label="Bank Name"
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
                    onClick={addOrUpdateBank}
                    className="col-span-1 md:col-span-2 h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {editingBankId !== null ? "Update Bank" : "Add Bank"}
                  </Button>
                </div>

                {formData.banks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-teal-700">Added Banks:</h4>
                    {formData.banks.map((bank) => (
                      <div
                        key={bank.id}
                        className="p-3 bg-white rounded-lg border border-teal-200 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{bank.bankName}</p>
                          <p className="text-sm text-gray-600">
                            {bank.accountHolderName} ••••
                            {bank.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editBank(bank)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBank(bank.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <CustomStepNavigation
                  currentStep={5}
                  totalSteps={6}
                  onPrevious={() => setActiveTab("tax")}
                  onNext={() => setActiveTab("settings")}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    Agent Logo
                  </h4>
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
                      <p className="text-sm font-medium text-gray-600">
                        Upload Logo
                      </p>
                    </label>
                    {formData.logoPreviewUrl && (
                      <div className="mt-4 relative">
                        <img
                          src={formData.logoPreviewUrl}
                          alt="Agent Logo"
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            setViewingImage({
                              previewUrl: formData.logoPreviewUrl,
                              type: "logo",
                            })
                          }
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
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    Registration Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {["GST", "PAN", "TAN", "MSME", "UDYAM"].map((docType) => {
                      const existingDoc = formData.registrationDocs.find(
                        (doc) => doc.type === docType
                      );

                      return (
                        <div
                          key={docType}
                          className="p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shadow-inner relative"
                        >
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            {docType} Document
                          </p>
                          <input
                            type="file"
                            id={`${docType.toLowerCase()}-doc`}
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(docType, e)}
                            accept="image/*,.pdf"
                          />

                          {/* Show upload button only if no document exists */}
                          {!existingDoc && (
                            <label
                              htmlFor={`${docType.toLowerCase()}-doc`}
                              className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors p-4 rounded-lg"
                            >
                              <Upload className="w-6 h-6 text-blue-500" />
                              <p className="text-sm text-gray-600">Upload</p>
                            </label>
                          )}

                          {/* Show document preview if document exists */}
                          {existingDoc && (
                            <div className="mt-4 w-full">
                              <p className="text-xs text-gray-500 truncate mb-2 text-center">
                                {existingDoc.fileName}
                              </p>

                              {/* Show image preview for image files */}
                              {existingDoc.previewUrl &&
                                !existingDoc.fileName
                                  ?.toLowerCase()
                                  .endsWith(".pdf") && (
                                  <img
                                    src={existingDoc.previewUrl}
                                    alt={`${docType} document`}
                                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                                    onClick={() => setViewingImage(existingDoc)}
                                  />
                                )}

                              {/* Show PDF preview for PDF files */}
                              {existingDoc.previewUrl &&
                                existingDoc.fileName
                                  ?.toLowerCase()
                                  .endsWith(".pdf") && (
                                  <div
                                    className="w-full h-32 bg-gray-100 rounded border flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200"
                                    onClick={() =>
                                      window.open(
                                        existingDoc.previewUrl,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <FileText className="w-8 h-8 text-red-500 mb-2" />
                                    <p className="text-xs text-gray-600">
                                      View PDF Document
                                    </p>
                                  </div>
                                )}

                              {/* Show file icon for other file types */}
                              {!existingDoc.previewUrl && (
                                <div className="w-full h-32 bg-gray-100 rounded border flex flex-col items-center justify-center">
                                  <File className="w-8 h-8 text-gray-400 mb-2" />
                                  <p className="text-xs text-gray-600">
                                    Document Uploaded
                                  </p>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className="flex gap-2 mt-3 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById(
                                        `${docType.toLowerCase()}-doc`
                                      )
                                      ?.click()
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Replace
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeDocument(existingDoc.id)}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Agent Priority
                    </label>
                    <select
                      value={formData.agentPriority}
                      onChange={(e) =>
                        handleSelectChange("agentPriority", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Internal Notes
                  </p>
                  <textarea
                    placeholder="Add any additional notes about the agent..."
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
                  submitLabel={editingAgent ? "Update Agent" : "Save Agent"}
                  isLastStep={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ImagePreviewDialog
        viewingImage={viewingImage}
        onClose={() => setViewingImage(null)}
      />
      <UniversalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedAgent}
        type="agent"
      />
    </div>
  );
};

export default AgentRegistrationPage;
