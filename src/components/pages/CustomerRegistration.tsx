import React, { useState, useMemo, useEffect, useRef } from "react";
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
  ChevronRight,
} from "lucide-react";
import CustomInputBox from "../customComponents/CustomInputBox";
import { Country, State, City } from "country-state-city";
import { useCustomerStore } from "../../../store/customerStore"; // Assuming a store similar to productStore
import { useCompanyStore } from "../../../store/companyStore";
import HeaderGradient from "../customComponents/HeaderGradint";
import FilterBar from "../customComponents/FilterBar";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import MultiStepNav from "../customComponents/MultiStepNav"; // Assuming it's exported from vendor or a shared file
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";
import TableHeader from "../customComponents/CustomTableHeader";
import PaginationControls from "../customComponents/CustomPaginationControls";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import ImagePreviewDialog from "../customComponents/ImagePreviewDialog";
import SelectedCompany from "../customComponents/SelectedCompany";
import { useAgentStore } from "../../../store/agentStore";
import UniversalDetailsModal from "../customComponents/UniversalDetailsModal";
import imageCompression from "browser-image-compression";
import { currencies } from "@/lib/currency";
import { getCurrency } from "@/lib/getCurrency";
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
  companyId: string;
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
  companyId: string;
  customerName: string;
  shortName: string;
  customerGroup: string;
  industryType: string;
  territory: string;
  salesPerson: string;
  customerStatus: string;
  status: string;
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
const stepIcons = {
  basic: <Users className="w-2 h-2 md:w-5 md:h-5 " />,
  contact: <Phone className="w-2 h-2 md:w-5 md:h-5 " />,
  financialSettings: <CreditCard className="w-2 h-2 md:w-5 md:h-5 " />,
  tax: <FileText className="w-2 h-2 md:w-5 md:h-5 " />,
  bank: <Building2 className="w-2 h-2 md:w-5 md:h-5 " />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5 " />,
};

const compressionOptions = {
  maxSizeMB: 1, // Max file size after compression_
  maxWidthOrHeight: 1920, // Max dimension_
  useWebWorker: true, // Use web worker for non-blocking_
  initialQuality: 0.8, // Start with 80% quality_
};

const CustomerRegistrationPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { agents } = useAgentStore();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  const limit = 10; // Fixed limit per page
  const {
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    customers,
    filterCustomers,
    pagination,
    loading,
    error,
    initialLoading,
    counts,
  } = useCustomerStore(); // Assuming store exists
  const { defaultSelected, companies } = useCompanyStore();
  const [formData, setFormData] = useState<CustomerForm>({
    customerType: "individual",
    customerCode: "",
    code: "",
    companyId: "",
    customerName: "",
    shortName: "",
    customerGroup: "",
    industryType: "",
    territory: "",
    salesPerson: "",
    customerStatus: "active",
    status: "active",
    companySize: "",
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
    priceList: "",
    paymentTerms: "",
    creditLimit: "",
    creditDays: "",
    discount: "",
    agent: "",
    isFrozenAccount: false,
    disabled: false,
    allowZeroValuation: false,
    taxId: "",
    vatNumber: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    taxCategory: "",
    taxTemplate: "",
    withholdingTaxCategory: "",
    msmeRegistration: "",
    isTaxExempt: false,
    reverseCharge: false,
    exportCustomer: false,
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    swiftCode: "",
    preferredPaymentMethod: "",
    acceptedPaymentMethods: [],
    creditCardDetails: "",
    paymentInstructions: "",
    approvalWorkflow: "",
    creditLimitApprover: "",
    documentRequired: "",
    externalSystemId: "",
    crmIntegration: "",
    dataSource: "manual",
    customerPriority: "medium",
    leadSource: "",
    internalNotes: "",
    allowPartialShipments: false,
    allowBackOrders: false,
    autoInvoice: false,
    banks: [],
    notes: "",
    registrationDocs: [],
  });
  useEffect(() => {
    if (defaultSelected) {
      setFormData((prev) => ({ ...prev, companyId: defaultSelected?._id }));
    }
  }, [defaultSelected, companies]);

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

  const getCurrencyForCountry = async (countryName: string) => {
    const country = allCountries.find((c) => c.name === countryName);

    if (!country) return null;

    // Use your API function (imported from lib)
    return await getCurrency(country.isoCode);
  };

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

  const handleSelectChange = async (
    name: keyof CustomerForm,
    value: string
  ) => {
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
        currency: "",
      }));
      const currency = await getCurrencyForCountry(value);

      // Update currency ONLY if it exists
      if (currency?.currencyCode) {
        setFormData((prev) => ({
          ...prev,
          currency: currency.currencyCode,
        }));
      }

      return;
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
    // Clean up logo
    if (
      formData.logoPreviewUrl &&
      formData.logoPreviewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(formData.logoPreviewUrl);
    }

    // Clean up documents
    formData.registrationDocs.forEach((doc) => {
      if (doc.previewUrl && doc.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  };

  const resetForm = () => {
    cleanupImageUrls();

    setFormData({
      customerType: "individual",
      customerCode: "",
      code: "",
      companyId: "",
      customerName: "",
      shortName: "",
      customerGroup: "",
      industryType: "",
      territory: "",
      salesPerson: "",
      customerStatus: "active",
      status: "active",
      companySize: "",
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
      priceList: "",
      paymentTerms: "",
      creditLimit: "",
      creditDays: "",
      discount: "",
      agent: "",
      isFrozenAccount: false,
      disabled: false,
      allowZeroValuation: false,
      taxId: "",
      vatNumber: "",
      gstNumber: "",
      panNumber: "",
      tanNumber: "",
      taxCategory: "",
      taxTemplate: "",
      withholdingTaxCategory: "",
      msmeRegistration: "",
      isTaxExempt: false,
      reverseCharge: false,
      exportCustomer: false,
      bankName: "",
      branchName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      swiftCode: "",
      preferredPaymentMethod: "",
      acceptedPaymentMethods: [],
      creditCardDetails: "",
      paymentInstructions: "",
      approvalWorkflow: "",
      creditLimitApprover: "",
      documentRequired: "",
      externalSystemId: "",
      crmIntegration: "",
      dataSource: "manual",
      customerPriority: "medium",
      leadSource: "",
      internalNotes: "",
      allowPartialShipments: false,
      allowBackOrders: false,
      autoInvoice: false,
      banks: [],
      notes: "",
      registrationDocs: [],
    });
    setEditingCustomer(null);
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

  const handleEditCustomer = (customer: Customer): void => {
    setEditingCustomer(customer);
    setFormData({
      ...customer,
      agent: customer.agent?._id || "",
      logoPreviewUrl: customer.logo || undefined,
      registrationDocs: customer.registrationDocs.map((doc, index) => ({
        id: Date.now() + index,
        type: doc.type,
        file: null, // No File for existing
        fileName: doc.fileName,
        previewUrl: doc.file, // Use URL as preview for existing images
      })),
    });
    setOpen(true);
  };

  const handleDeleteCustomer = (id: string): void => {
    deleteCustomer(id);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.customerName.trim()) {
      toast.error("Please enter Customer Name");
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

    const customerFormData = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof CustomerForm];

      if (
        key === "registrationDocs" ||
        key === "banks" ||
        key === "logoFile" ||
        key === "logoPreviewUrl" ||
        key === "acceptedPaymentMethods"
      ) {
        return;
      }

      if (value !== null && value !== undefined && value !== "") {
        customerFormData.append(key, String(value));
      }
    });
    customerFormData.append("companyID", formData.companyId);

    customerFormData.append("banks", JSON.stringify(formData.banks));
    customerFormData.append(
      "acceptedPaymentMethods",
      JSON.stringify(formData.acceptedPaymentMethods || [])
    );

    if (formData.logoFile) {
      customerFormData.append("logo", formData.logoFile);
    }

    const newRegistrationDocs = formData.registrationDocs.filter(
      (doc) => doc.file && doc.file instanceof Blob
    );

    newRegistrationDocs.forEach((doc) => {
      customerFormData.append("registrationDocs", doc.file!);
    });
    if (newRegistrationDocs.length > 0) {
      customerFormData.append(
        "registrationDocTypes",
        JSON.stringify(newRegistrationDocs.map((doc) => doc.type))
      );
    }

    if (editingCustomer) {
      await updateCustomer({
        id: editingCustomer._id || "",
        customer: customerFormData,
      });
    } else {
      await addCustomer(customerFormData);
      await fetchCustomers(currentPage, limit, defaultSelected?._id);
    }
    setOpen(false);
    resetForm();
  };

  const stats = useMemo(
    () => ({
      totalCustomers: pagination?.total,
      gstRegistered: counts?.gstRegistered,
      msmeRegistered: counts?.msmeRegistered,
      activeCustomers: counts?.activeCustomers,
      vatRegistered: counts?.vatRegistered,
    }),
    [filteredCustomers, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "financialSettings", label: "Financial Settings" },
    { id: "tax", label: "Tax Information" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" },
  ];

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);
  // Initial fetch
  // useEffect(() => {
  //   console.log(defaultSelected);
  //   fetchCustomers(currentPage, limit, defaultSelected?._id);
  // }, [fetchCustomers, currentPage, defaultSelected]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 3) {
        filterCustomers(
          searchTerm,
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        )
          .then((result) => {
            setFilteredCustomers(result);
          })
          .catch((err) => {
            console.error("Error filtering customers:", err);
          });
      } else if (searchTerm.length === 0) {
        filterCustomers(
          "",
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        );
      }
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    statusFilter,
    sortBy,
    currentPage,
    filterCustomers,
    limit,
    defaultSelected,
  ]);

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const headers = ["Customer", "Contact", "Address", "Status", "Actions"];
  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <tr
                key={customer._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {customer.customerName}
                    </div>
                    <div className="text-sm text-gray-500">{customer.code}</div>
                    {customer.shortName && (
                      <div className="text-sm text-gray-500">
                        Short: {customer.shortName}
                      </div>
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
                    {[customer.city, customer.state, customer.country]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      customer.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    } hover:bg-green-100`}
                  >
                    {customer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ActionsDropdown
                    onView={() => handleViewCustomer(customer)}
                    onEdit={() => handleEditCustomer(customer)}
                    onDelete={() => handleDeleteCustomer(customer._id || "")}
                    module="BusinessManagement"
                    subModule="CustomerRegistration"
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
        <Card
          key={customer._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {customer.logo && (
                  <img
                    src={customer.logo}
                    alt="Customer Logo"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    {customer.customerName}
                  </CardTitle>
                  {customer.shortName && (
                    <p className="text-teal-600 font-medium">
                      {customer.shortName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{customer.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    customer.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-green-100`}
                >
                  {customer.status}
                </Badge>
                <ActionsDropdown
                  onView={() => handleViewCustomer(customer)}
                  onEdit={() => handleEditCustomer(customer)}
                  onDelete={() => handleDeleteCustomer(customer._id || "")}
                  module="BusinessManagement"
                  subModule="CustomerRegistration"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {customer.contactPerson && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {customer.contactPerson}
                  </span>
                </div>
              )}

              {(customer.city || customer.state || customer.zipCode) && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">
                    {[customer.city, customer.state, customer.zipCode]
                      .filter(Boolean)
                      .join(", ")}
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
                <span className="text-gray-600 truncate">
                  {customer.emailAddress}
                </span>
              </div>

              {customer.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-teal-600 truncate">
                    {customer.website}
                  </span>
                </div>
              )}
            </div>

            {(customer.gstNumber ||
              customer.msmeRegistration ||
              customer.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {customer.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      GST
                    </span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {customer.gstNumber}
                    </span>
                  </div>
                )}

                {customer.msmeRegistration && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      MSME
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-mono">
                      {customer.msmeRegistration}
                    </span>
                  </div>
                )}

                {customer.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      PAN
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                      {customer.panNumber}
                    </span>
                  </div>
                )}
              </div>
            )}

            {customer.banks.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Bank Accounts
                </p>
                <div className="space-y-2">
                  {customer.banks.slice(0, 2).map((bank) => (
                    <div
                      key={bank.id}
                      className="text-xs bg-gray-100 p-2 rounded"
                    >
                      <p className="font-medium truncate">{bank.bankName}</p>
                      <p className="text-gray-600 truncate">
                        A/C: ••••{bank.accountNumber.slice(-4)}
                      </p>
                    </div>
                  ))}
                  {customer.banks.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{customer.banks.length - 2} more
                    </p>
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
      setSortBy("dateDesc");
      setCurrentPage(1);
    }}
  />;
  useEffect(() => {
    return () => {
      initialLoading();
    };
  }, []);
  return (
    <div className="custom-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-4  sticky top-0 bg-white py-2 z-20">
        <HeaderGradient
          title="Customer Management"
          subtitle="Manage your customer information and registrations"
        />
        <CheckAccess
          module="BusinessManagement"
          subModule="CustomerRegistration"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              if (defaultSelected && companies.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  companyId: defaultSelected?._id,
                }));
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Add Customer
          </Button>
        </CheckAccess>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Customers
                </p>
                <p className="text-2xl font-bold">{stats.totalCustomers}</p>
              </div>
              <Users className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>

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

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  MSME Registered
                </p>
                <p className="text-2xl font-bold">{stats.msmeRegistered}</p>
              </div>
              <Star className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  VAT Registered
                </p>
                <p className="text-3xl font-bold">{stats?.vatRegistered}</p>
              </div>
              <Star className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{stats.activeCustomers}</p>
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

      {pagination?.total === 0 ? (
        <EmptyStateCard
          icon={Users}
          title="No customers registered yet"
          description="Create your first customer to get started"
          buttonLabel="Add Your First Customer"
          module="BusinessManagement"
          subModule="CustomerRegistration"
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
            itemName="Customers"
          />
        </>
      )}

      {/* Modal Form */}
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
            onStepChange={(nextTab) => {
              const stepOrder = [
                "basic",
                "contact",
                "financialSettings",
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
                if (!formData.customerName) {
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
                if (!formData.customerName) {
                  toast.error("Company Name is required");
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
                      Customer Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) =>
                        handleSelectChange("customerType", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                    </select>
                  </div>
                  <SelectedCompany />
                  {/* <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.companyId}
                      onChange={(e) =>
                        handleSelectChange("companyId", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.namePrint}
                        </option>
                      ))}
                    </select>
                  </div> */}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Customer Name "
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
                    <label className="text-sm font-semibold text-gray-700">
                      Customer Group
                    </label>
                    <select
                      value={formData.customerGroup}
                      onChange={(e) =>
                        handleSelectChange("customerGroup", e.target.value)
                      }
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
                    <label className="text-sm font-semibold text-gray-700">
                      Industry Type
                    </label>
                    <select
                      value={formData.industryType}
                      onChange={(e) =>
                        handleSelectChange("industryType", e.target.value)
                      }
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
                    <label className="text-sm font-semibold text-gray-700">
                      Territory
                    </label>
                    <select
                      value={formData.territory}
                      onChange={(e) =>
                        handleSelectChange("territory", e.target.value)
                      }
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
                  {/* <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Sales Person
                    </label>
                    <select
                      value={formData.salesPerson}
                      onChange={(e) =>
                        handleSelectChange("salesPerson", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Sales Person</option>
                      <option value="john">John Smith</option>
                      <option value="jane">Jane Doe</option>
                      <option value="mike">Mike Johnson</option>
                    </select>
                  </div> */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Agent
                    </label>
                    <select
                      value={formData.agent}
                      onChange={(e) =>
                        handleSelectChange("agent", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent} value={agent._id}>
                          {agent.agentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Customer Status
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

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Company Size
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) =>
                        handleSelectChange("companySize", e.target.value)
                      }
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
                  onNext={() => {
                    if (!formData.customerName) {
                      toast.error("Please fill customer name.");
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
                    label="Email Address"
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
                      <label className="text-sm font-semibold text-gray-700">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          handleSelectChange("country", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      >
                        {allCountries.map((country) => (
                          <option key={country.isoCode} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          handleSelectChange("state", e.target.value)
                        }
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                        disabled={availableStates.length === 0}
                      >
                        <option value="">Select State</option>
                        {availableStates.map((state) => (
                          <option key={state.isoCode} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
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
                    setActiveTab("financialSettings");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "financialSettings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        handleSelectChange("currency", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Currency</option>

                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name} {c.symbol ? `(${c.symbol})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Price List
                    </label>
                    <select
                      value={formData.priceList}
                      onChange={(e) =>
                        handleSelectChange("priceList", e.target.value)
                      }
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

                {/* Bank List */}
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
                    Customer Logo
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
                          alt="Customer Logo"
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

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Customer Priority
                    </label>
                    <select
                      value={formData.customerPriority}
                      onChange={(e) =>
                        handleSelectChange("customerPriority", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Lead Source
                    </label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) =>
                        handleSelectChange("leadSource", e.target.value)
                      }
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
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Internal Notes
                  </p>
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
                  submitLabel={
                    editingCustomer ? "Update Customer" : "Save Customer"
                  }
                  isLastStep={true}
                />
              </div>
            )}
          </div>
          {/* </div> */}
        </DialogContent>
      </Dialog>

      {/* Image viewing modal */}
      <ImagePreviewDialog
        viewingImage={viewingImage}
        onClose={() => setViewingImage(null)}
      />
      <UniversalDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedCustomer}
        type="customer"
      />
    </div>
  );
};

export default CustomerRegistrationPage;
