import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Globe,
  Plus,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle,
  UserCheck,
  Target,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import { useCompanyStore } from "../../../store/companyStore";
import { useLedgerStore } from "../../../store/ladgerStore";
import CustomInputBox from "../customComponents/CustomInputBox";
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
import SectionHeader from "../customComponents/SectionHeader";
import EmptyStateCard from "../customComponents/EmptyStateCard";
import ImagePreviewDialog from "../customComponents/ImagePreviewDialog";
import SelectedCompany from "../customComponents/SelectedCompany";

// Step icons for multi-step navigation
const stepIcons = {
  basic: <Users className="w-2 h-2 md:w-5 md:h-5" />,
  contact: <Phone className="w-2 h-2 md:w-5 md:h-5" />,
  tax: <FileText className="w-2 h-2 md:w-5 md:h-5" />,
  bank: <Building2 className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

// Interfaces
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

interface Ledger {
  id: number;
  _id?: string;
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
  companyId: string;
  ledgerGroup: string;
  industryType: string;
  territory: string;
  ledgerStatus: string;
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

interface LedgerForm {
  ledgerType: string;
  ledgerCode: string;
  ledgerName: string;
  shortName: string;
  companyId: string;
  ledgerGroup: string;
  industryType: string;
  territory: string;
  ledgerStatus: string;
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
  logoFile?: File;
  logoPreviewUrl?: string;
  notes: string;
  registrationDocs: RegistrationDocument[];
}

const LedgerRegistration: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "suspended"
  >("all");
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [filteredLedgers, setFilteredLedgers] = useState<Ledger[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const limit = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    ledgers,
    fetchLedgers,
    addLedger,
    updateLedger,
    deleteLedger,
    filterLedgers,
    pagination,
    loading,
    initialLoading
  } = useLedgerStore();
  const { companies, defaultSelected } = useCompanyStore();

  useEffect(() => {
    setFilteredLedgers(ledgers);
  }, [ledgers]);
  // Initial fetch
  // useEffect(() => {
  //   fetchLedgers(currentPage, limit, defaultSelected?._id);
  // }, [fetchLedgers, currentPage, defaultSelected]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
            if (searchTerm.length >= 3){
      filterLedgers(
        searchTerm,
        statusFilter,
        sortBy,
        currentPage,
        limit,
        defaultSelected?._id
      )
        .then((result) => {
          setFilteredLedgers(result);
        })
        .catch((err) => {
          console.error("Error filtering ledgers:", err);
          toast.error("Error", {
            description: "Failed to filter ledgers. Please try again.",
          });
        });
      } else if ( searchTerm.length === 0){
        filterLedgers(
          "",
          statusFilter,
          sortBy,
          currentPage,
          limit,
          defaultSelected?._id
        )
        .then((result) => {
          setFilteredLedgers(result);
        })
        .catch((err) => {
          console.error("Error filtering ledgers:", err);
          toast.error("Error", {
            description: "Failed to filter ledgers. Please try again.",
          });
        });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    statusFilter,
    sortBy,
    currentPage,
    filterLedgers,
    defaultSelected,
  ]);

  const [formData, setFormData] = useState<LedgerForm>({
    ledgerType: "individual",
    ledgerCode: "",
    ledgerName: "",
    shortName: "",
    companyId: "",
    ledgerGroup: "",
    industryType: "",
    territory: "",
    ledgerStatus: "active",
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
    taxId: "",
    vatNumber: "",
    gstNumber: "",
    panNumber: "",
    tanNumber: "",
    taxCategory: "",
    taxTemplate: "",
    withholdingTaxCategory: "",
    isTaxExempt: false,
    reverseCharge: false,
    isFrozenAccount: false,
    disabled: false,
    bankName: "",
    branchName: "",
    accountNumber: "",
    accountHolderName: "",
    ifscCode: "",
    swiftCode: "",
    banks: [],
    externalSystemId: "",
    dataSource: "manual",
    ledgerPriority: "medium",
    leadSource: "",
    internalNotes: "",
    notes: "",
    registrationDocs: [],
  });
  useEffect(() => {
    if (defaultSelected) {
      setFormData((prev) => ({ ...prev, companyId: defaultSelected?._id }));
    }
  }, [defaultSelected, companies]);
  // Country, State, City Data
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

  // Handlers
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

  const handleSelectChange = (name: keyof LedgerForm, value: string): void => {
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
  };

  const addBank = (): void => {
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
    setFormData((prev) => ({
      ...prev,
      banks: [...prev.banks, { ...bankForm, id: Date.now() }],
    }));
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
  const editBank = (bank: Bank): void => {
    setBankForm(bank);
    setEditingBankId(bank.id);
  };
  const removeBank = (id: number): void => {
    setFormData((prev) => ({
      ...prev,
      banks: prev.banks.filter((bank) => bank.id !== id),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        logoFile: file,
        logoPreviewUrl: previewUrl,
      }));
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

  const handleDocumentUpload = (
    type: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const newDoc: RegistrationDocument = {
        id: Date.now(),
        type,
        file,
        previewUrl,
        fileName: file.name,
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
      ledgerType: "individual",
      ledgerCode: "",
      ledgerName: "",
      shortName: "",
      companyId: "",
      ledgerGroup: "",
      industryType: "",
      territory: "",
      ledgerStatus: "active",
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
      taxId: "",
      vatNumber: "",
      gstNumber: "",
      panNumber: "",
      tanNumber: "",
      taxCategory: "",
      taxTemplate: "",
      withholdingTaxCategory: "",
      isTaxExempt: false,
      reverseCharge: false,
      isFrozenAccount: false,
      disabled: false,
      bankName: "",
      branchName: "",
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      swiftCode: "",
      banks: [],
      externalSystemId: "",
      dataSource: "manual",
      ledgerPriority: "medium",
      leadSource: "",
      internalNotes: "",
      notes: "",
      registrationDocs: [],
    });
    setEditingLedger(null);
    setActiveTab("basic");
  };

  const handleEditLedger = (ledger: Ledger): void => {
    setEditingLedger(ledger);
    setFormData({
      ...ledger,
      logoPreviewUrl: ledger.logo || undefined,
      registrationDocs: ledger.registrationDocs.map((doc) => ({
        ...doc,
        previewUrl: doc.previewUrl, // Assuming previewUrl is URL or base64
      })),
    });
    setOpen(true);
  };

  const handleDeleteLedger = (id: string): void => {
    deleteLedger(id);
  };

  const handleSubmit = async(): Promise<void> => {
    if (!formData.ledgerName.trim()) {
      toast.error("Please enter Ledger Name");
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

    const ledgerFormData = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof LedgerForm];
      if (
        key === "registrationDocs" ||
        key === "banks" ||
        key === "logoFile" ||
        key === "logoPreviewUrl"
      )
        return;
      if (value !== null && value !== undefined && value !== "") {
        ledgerFormData.append(key, String(value));
      }
    });
    ledgerFormData.append("companyID", formData.companyId);
    ledgerFormData.append("banks", JSON.stringify(formData.banks));
    if (formData.logoFile) {
      ledgerFormData.append("logo", formData.logoFile);
    }
    formData.registrationDocs.forEach((doc) => {
      ledgerFormData.append("registrationDocs", doc.file);
    });
    ledgerFormData.append(
      "registrationDocTypes",
      JSON.stringify(formData.registrationDocs.map((doc) => doc.type))
    );
    ledgerFormData.append(
      "registrationDocsCount",
      String(formData.registrationDocs.length)
    );

    if (editingLedger) {
      updateLedger({ id: editingLedger._id || "", ledger: ledgerFormData });
      toast.success("ledger updated successfully");
    } else {
      await addLedger(ledgerFormData);
      fetchLedgers(currentPage, limit, defaultSelected?._id);
      toast.success("Ledger added successfully");
    }
    setOpen(false);
    resetForm();
  };

  const stats = useMemo(
    () => ({
      totalLedgers: pagination?.total || 0,
      activeLedgers:
        statusFilter === "active"
          ? pagination?.total
          : filteredLedgers.filter((c) => c.status === "active").length,
      gstRegistered: filteredLedgers.filter((c) => c.gstNumber?.trim() !== "")
        .length,
      individualAccounts: filteredLedgers.filter(
        (c) => c.ledgerType === "individual"
      ).length,
    }),
    [filteredLedgers, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "tax", label: "Tax Information" },
    { id: "bank", label: "Banking Details" },
    { id: "settings", label: "Settings" },
  ];
  const headers = ["Ledger", "Contact", "Address", "Status", "Actions"];
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLedgers.map((ledger) => (
              <tr
                key={ledger._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCheck className="h-10 w-10 text-teal-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ledger.ledgerName}
                      </div>
                      <div className="text-sm text-teal-600">
                        {ledger.ledgerCode}
                      </div>
                      {ledger.shortName && (
                        <div className="text-xs text-gray-500">
                          Short: {ledger.shortName}
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
                        {ledger.emailAddress}
                      </span>
                    </div>
                    {ledger.mobileNumber && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 text-gray-400 mr-2" />
                        <span>{ledger.mobileNumber}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 space-y-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 text-gray-400 mr-2" />
                      <span>
                        {[ledger.city, ledger.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-48">
                      {ledger.addressLine1}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      ledger.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    } hover:bg-current`}
                  >
                    {ledger.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckAccess
                    module="BusinessManagement"
                    subModule="Ledger"
                    type="update"
                  >
                    <ActionsDropdown
                      onEdit={() => handleEditLedger(ledger)}
                      onDelete={() => handleDeleteLedger(ledger._id || "")}
                      module="BusinessManagement"
                      subModule="Ledger"
                    />
                  </CheckAccess>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredLedgers.map((ledger: Ledger) => (
        <Card
          key={ledger._id}
          className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group"
        >
          <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {ledger.logo && (
                  <img
                    src={ledger.logo}
                    alt="Ledger Logo"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                    {ledger.ledgerName}
                  </CardTitle>
                  {ledger.shortName && (
                    <p className="text-teal-600 font-medium">
                      {ledger.shortName}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{ledger.ledgerCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`${
                    ledger.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  } hover:bg-current`}
                >
                  {ledger.status}
                </Badge>
                <CheckAccess
                  module="BusinessManagement"
                  subModule="Ledger"
                  type="update"
                >
                  <ActionsDropdown
                    onEdit={() => handleEditLedger(ledger)}
                    onDelete={() => handleDeleteLedger(ledger._id || "")}
                    module="BusinessManagement"
                    subModule="Ledger"
                  />
                </CheckAccess>
              </div>
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
                    {[ledger.city, ledger.state, ledger.zipCode]
                      .filter(Boolean)
                      .join(", ")}
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
                <span className="text-gray-600 truncate">
                  {ledger.emailAddress}
                </span>
              </div>
              {ledger.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-teal-600 truncate">
                    {ledger.website}
                  </span>
                </div>
              )}
            </div>
            {ledger.banks.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Bank Accounts
                </p>
                <div className="space-y-2">
                  {ledger.banks.slice(0, 2).map((bank) => (
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
                  {ledger.banks.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{ledger.banks.length - 2} more
                    </p>
                  )}
                </div>
              </div>
            )}
            {(ledger.gstNumber || ledger.panNumber) && (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {ledger.gstNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      GST
                    </span>
                    <span className="text-xs bg-blue-100 text-teal-700 px-2 py-1 rounded font-mono">
                      {ledger.gstNumber}
                    </span>
                  </div>
                )}
                {ledger.panNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">
                      PAN
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">
                      {ledger.panNumber}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  Created: {new Date(ledger.createdAt).toLocaleDateString()}
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
          title="Ledger Management"
          subtitle="Manage your ledger information and registrations"
        />
        <CheckAccess
          module="BusinessManagement"
          subModule="Ledger"
          type="create"
        >
          <Button
            onClick={() => {
              resetForm();
              setOpen(true);
              if (defaultSelected && companies.length > 0) {
                const selectedCompany = companies.find(
                  (c) => c._id === defaultSelected?._id
                );
                if (selectedCompany) {
                  setFormData((prev) => ({
                    ...prev,
                    companyID: selectedCompany._id,
                  }));
                }
              }
              setOpen(true);
            }}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            Add Ledger
          </Button>
        </CheckAccess>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">
                  Total Ledgers
                </p>
                <p className="text-2xl font-bold">{stats.totalLedgers}</p>
              </div>
              <UserCheck className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">
                  Active Ledgers
                </p>
                <p className="text-2xl font-bold">{stats.activeLedgers}</p>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  GST Registered
                </p>
                <p className="text-2xl font-bold">{stats.gstRegistered}</p>
              </div>
              <FileText className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  Individual Accounts
                </p>
                <p className="text-2xl font-bold">{stats.individualAccounts}</p>
              </div>
              <Target className="w-6 h-6 text-purple-200" />
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
          title="No ledgers registered yet"
          description="Create your first ledger to get started"
          buttonLabel="Add Your First Ledger"
          module="BusinessManagement"
          subModule="Ledger"
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
            itemName="ledgers"
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
            title={editingLedger ? "Edit Ledger" : "Add New Ledger"}
            subtitle={
              editingLedger
                ? "Update the ledger details"
                : "Complete ledger registration information"
            }
          />

          <MultiStepNav
            steps={tabs}
            currentStep={activeTab}
            onStepChange={(nextTab) => {
              const stepOrder = ["basic", "contact", "tax", "bank", "settings"];
              const currentIndex = stepOrder.indexOf(activeTab);
              const nextIndex = stepOrder.indexOf(nextTab);

              if (nextIndex < currentIndex) {
                setActiveTab(nextTab);
              }
              if (activeTab === "basic") {
                if (!formData.ledgerName) {
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
                if (!formData.ledgerName) {
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
                      Ledger Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.ledgerType}
                      onChange={(e) =>
                        handleSelectChange("ledgerType", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="individual">Individual</option>
                      <option value="company">Company</option>
                      <option value="partnership">Partnership</option>
                      <option value="trust">Trust</option>
                      <option value="trust">Others</option>
                    </select>
                  </div>
                  <SelectedCompany />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInputBox
                    label="Ledger Name"
                    placeholder="e.g., ABC Ledger"
                    name="ledgerName"
                    value={formData.ledgerName}
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
                      Ledger Group
                    </label>
                    <select
                      value={formData.ledgerGroup}
                      onChange={(e) =>
                        handleSelectChange("ledgerGroup", e.target.value)
                      }
                      className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                    >
                      <option value="">Select Ledger Group</option>
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="bank">Bank</option>
                      <option value="cash">Cash</option>
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
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">
                      Ledger Status
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
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                </div>

                <CustomStepNavigation
                  currentStep={1}
                  totalSteps={5}
                  showPrevious={false}
                  onNext={() => {
                    if (!formData.ledgerName) {
                      toast.error("Please fill Ledger name.");
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
                  totalSteps={5}
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
                    setActiveTab("tax");
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "tax" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
                </div>

                {formData.country?.toLowerCase() === "india" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                {/* <SectionHeader
        icon={<Building2 className="w-4 h-4 text-white" />}
        title="Bank Details"
        gradientFrom="from-purple-400"
        gradientTo="to-purple-500"
      /> */}

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
                  currentStep={4}
                  totalSteps={5}
                  onPrevious={() => setActiveTab("tax")}
                  onNext={() => setActiveTab("settings")}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                {/* <SectionHeader
        icon={<Settings2 className="w-4 h-4 text-white" />}
        title="Settings "
        gradientFrom="from-cyan-400"
        gradientTo="to-cyan-500"
      /> */}

                <div className="mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                    Ledger Logo
                  </h4>
                  <div className="p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shadow-inner">
                    <input
                      type="file"
                      id="logo"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                      ref={fileInputRef}
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
                          alt="Ledger Logo"
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
                      Ledger Priority
                    </label>
                    <select
                      value={formData.ledgerPriority}
                      onChange={(e) =>
                        handleSelectChange("ledgerPriority", e.target.value)
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

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="reverseCharge"
                      checked={formData.reverseCharge}
                      onChange={handleChange}
                      className="mr-3 h-5 w-5 rounded border-2 border-gray-300 focus:ring-blue-500"
                    />
                    Reverse Charge
                  </label>
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
                </div> */}

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Internal Notes
                  </p>
                  <textarea
                    placeholder="Add any additional notes about the ledger..."
                    name="internalNotes"
                    value={formData.internalNotes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none transition-all"
                  />
                </div>

                <CustomStepNavigation
                  currentStep={5}
                  totalSteps={5}
                  onPrevious={() => setActiveTab("bank")}
                  onSubmit={handleSubmit}
                  submitLabel={editingLedger ? "Update Ledger" : "Save Ledger"}
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
    </div>
  );
};

export default LedgerRegistration;
