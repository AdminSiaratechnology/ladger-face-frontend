import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Building2,
  Globe,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Star,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Settings2,
  ArrowBigDownDash,
  Users,
} from "lucide-react";

import { Country, State, City } from "country-state-city";
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
import CheckboxWithLabel from "../customComponents/CheckboxWithLabel";
import type { Value } from "@radix-ui/react-select";
import { SwitchThumb } from "@radix-ui/react-switch";
import CompanySelectorModal from "../customComponents/CompanySelectorModal";

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

// Company interface (updated with new fields)
interface Company {
  id: number;
  _id?: string;
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  code: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  vatNumber?: string;
  msmeNumber?: string;
  udyamNumber?: string;
  defaultCurrency: string;
  banks: Bank[];
  logo: string | null;
  notes: string;
  bookStartingDate?: string;
  financialDate?: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  status: "active" | "inactive";
}

// Form interface (updated with new fields)
interface CompanyForm {
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  code: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax?: string;
  email: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  vatNumber?: string;
  msmeNumber?: string;
  udyamNumber?: string;
  defaultCurrency: string;
  banks: Bank[];
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  bookStartingDate?: string;
  financialDate?: string;
  registrationDocs: RegistrationDocument[];
  status: "active" | "inactive";
  maintainGodown?: boolean;
  maintainBatch?: boolean;
  closingQuantityOrder?: boolean;
  negativeOrder?: boolean;
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
  basic: <Building2 className="w-2 h-2 md:w-5 md:h-5" />,
  contact: <Phone className="w-2 h-2 md:w-5 md:h-5" />,
  registration: <FileText className="w-2 h-2 md:w-5 md:h-5" />,
  bank: <CreditCard className="w-2 h-2 md:w-5 md:h-5" />,
  branding: <ImageIcon className="w-2 h-2 md:w-5 md:h-5" />,
  settings: <Settings2 className="w-2 h-2 md:w-5 md:h-5" />,
};

const CompanyPage: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
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
    branch: "",
  });
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
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
  // const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10; // Fixed limit per page
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);

  const {
    companies,
    pagination,
    loading,
    error,
    fetchCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    filterCompanies,
    defaultSelected,
  } = useCompanyStore();

  console.log("Companies from store:", companies);

  const [formData, setFormData] = useState<CompanyForm>({
    namePrint: "",
    nameStreet: "",
    address1: "",
    address2: "",
    address3: "",
    code: "",
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
    vatNumber: "",
    msmeNumber: "",
    udyamNumber: "",
    defaultCurrency: "INR",
    banks: [],
    notes: "",
    bookStartingDate: "",
    financialDate: "",
    registrationDocs: [],
    status: "active",
    maintainGodown: false,
    maintainBatch: false,
    closingQuantityOrder: false,
    negativeOrder: false,
  });

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

  const handleSelectChange = (name: keyof CompanyForm, value: string): void => {
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        state: "",
        city: "",
        defaultCurrency: getCurrencyForCountry(value),
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
  const handleCheckSelectChange = (key: keyof CompanyForm, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setBankForm((prev) => ({
      ...prev,
      [name]: value,
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
      namePrint: "",
      nameStreet: "",
      address1: "",
      address2: "",
      address3: "",
      code: "",
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
      vatNumber: "",
      msmeNumber: "",
      udyamNumber: "",
      defaultCurrency: "INR",
      banks: [],
      notes: "",
      bookStartingDate: "",
      financialDate: "",
      registrationDocs: [],
      status: "active",
      maintainGodown: false,
      maintainBatch: false,
      closingQuantityOrder: false,
      negativeOrder: false,
    });
    setEditingCompany(null);
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

  const handleEditCompany = (company: Company): void => {
    setEditingCompany(company);
    setFormData({
      ...company,
      logoPreviewUrl: company.logo || undefined,
      registrationDocs: company.registrationDocs.map((doc) => ({
        ...doc,
        previewUrl: doc.previewUrl, // Assuming previewUrl is URL or base64, adjust if needed
      })),
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
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(formData.pincode.trim())) {
      toast.error("Pincode must be a 6-digit number");
      return;
    }

    const companyFormData = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof CompanyForm];

      if (
        key === "registrationDocs" ||
        key === "banks" ||
        key === "logoFile" ||
        key === "logoPreviewUrl"
      ) {
        return;
      }

      if (value !== null && value !== undefined && value !== "") {
        companyFormData.append(key, String(value));
      }
    });

    companyFormData.append("banks", JSON.stringify(formData.banks));

    if (formData.logoFile) {
      companyFormData.append("logo", formData.logoFile);
    }

    formData.registrationDocs.forEach((doc) => {
      companyFormData.append("registrationDocs", doc.file);
    });
    companyFormData.append(
      "registrationDocTypes",
      JSON.stringify(formData.registrationDocs.map((doc) => doc.type))
    );
    companyFormData.append(
      "registrationDocsCount",
      String(formData.registrationDocs.length)
    );

    if (editingCompany) {
      updateCompany({
        companyId: editingCompany._id || "",
        companyData: companyFormData,
      });
    } else {
      addCompany(companyFormData);
    }
    setOpen(false);
    resetForm();
  };
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) =>
        statusFilter === "all" ? true : c.status === statusFilter
      )
      .filter((c) =>
        searchTerm
          ? c.namePrint.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      )
      .sort((a, b) => {
        if (sortBy === "nameAsc") return a.namePrint.localeCompare(b.namePrint);
        if (sortBy === "nameDesc")
          return b.namePrint.localeCompare(a.namePrint);
        if (sortBy === "dateAsc")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sortBy === "dateDesc")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        return 0;
      });
  }, [companies, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(
    () => ({
      totalCompanies: pagination?.total,
      gstRegistered: filteredCompanies?.filter(
        (c) => c.gstNumber?.trim() !== ""
      ).length,
      msmeRegistered: filteredCompanies?.filter(
        (c) => c.msmeNumber?.trim() !== ""
      ).length,
      activeCompanies:
        statusFilter === "active"
          ? pagination?.total
          : filteredCompanies?.filter((c) => c.status === "active").length,
    }),
    [filteredCompanies, pagination, statusFilter]
  );

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "contact", label: "Contact Details" },
    { id: "registration", label: "Registration Details" },
    { id: "bank", label: "Banking Details" },
    { id: "branding", label: "Branding" },
    { id: "settings", label: "Settings" },
  ];

  // Initial fetch
  useEffect(() => {
    fetchCompanies("", currentPage, limit);
  }, [fetchCompanies, currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Filtering with debounce
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     filterCompanies(
  //       searchTerm,
  //       statusFilter,
  //       sortBy,
  //       "68c1503077fd742fa21575df",
  //       currentPage,
  //       limit
  //     )
  //       .then((result) => {
  //         setFilteredCompanies(result);
  //       })
  //       .catch((err) => {
  //         console.error("Error filtering companies:", err);
  //       });
  //   }, 500); // 500ms debounce time

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [searchTerm, statusFilter, sortBy, currentPage, filterCompanies,]);

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  const headers = ["Company", "Contact", "Registration", "Status", "Actions"];
  const setDefaultCompany = useCompanyStore((state) => state.setDefaultCompany);
  const handleSelect = (company) => {
    setDefaultCompany(company._id);
    setShowCompanyPopup(false);
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr
                key={company._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {company.namePrint}
                      </div>
                      {company.code && (
                        <div className="text-xs text-gray-500 truncate">
                          {company.code}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                  <div className="text-xs sm:text-sm text-gray-900 space-y-0.5">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{company.email}</span>
                    </div>
                    {company.mobile && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{company.mobile}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <div className="text-xs sm:text-sm text-gray-900 space-y-0.5">
                    {company.country === "India" ? (
                      company.gstNumber ? (
                        <div className="flex items-center space-x-1">
                          <span className="truncate">GST:</span>
                          <span className="bg-blue-100 text-teal-700 px-1 py-0.5 rounded font-mono truncate">
                            {company.gstNumber}
                          </span>
                        </div>
                      ) : null
                    ) : (
                      <>
                        {company.vatNumber && (
                          <div className="flex items-center space-x-1">
                            <span className="truncate">VAT:</span>
                            <span className="bg-blue-100 text-teal-700 px-1 py-0.5 rounded font-mono truncate">
                              {company.vatNumber}
                            </span>
                          </div>
                        )}
                        {company.tanNumber && (
                          <div className="flex items-center space-x-1">
                            <span className="truncate">TAN:</span>
                            <span className="bg-blue-100 text-teal-700 px-1 py-0.5 rounded font-mono truncate">
                              {company.tanNumber}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                  <Badge
                    className={`${
                      company.status === "active"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-100 text-red-700"
                    } hover:bg-green-100 text-xs py-1 px-3 capitalize`}
                  >
                    {company.status}
                  </Badge>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right">
                  <ActionsDropdown
                    onEdit={() => handleEditCompany(company)}
                    onDelete={() => handleDeleteCompany(company._id || "")}
                    module="BusinessManagement"
                    subModule="Company"
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {filteredCompanies.map((company) => (
      <Card
        key={company._id}
        className="group bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden h-full flex flex-col hover:border-teal-200 hover:-translate-y-1"
      >
        <CardHeader className="px-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start justify-between gap-2">
            {/* Company name section with flex constraints */}
            <div className="flex items-center flex-1 min-w-0 max-w-[60%]">
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center mr-2 rounded-lg ${
                  !company.logo
                    ? "bg-gradient-to-br from-teal-300 to-teal-500 shadow-sm"
                    : "bg-white border border-gray-200"
                }`}
              >
                {company.logo ? (
                  <img
                    className="w-4 h-4 object-contain"
                    src={company.logo}
                    alt={`${company.namePrint} logo`}
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-semibold text-gray-900 truncate">
                  {company.namePrint}
                </CardTitle>
                {company.code && (
                  <p className="text-[10px] text-teal-600 font-medium truncate">
                    {company.code}
                  </p>
                )}
              </div>
            </div>

            {/* Status and actions - ensured to always be visible */}
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Badge
                variant="outline"
                className={`text-[10px] py-0.5 px-2 capitalize border-0 whitespace-nowrap ${
                  company.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {company.status}
              </Badge>
              <ActionsDropdown
                onEdit={() => handleEditCompany(company)}
                onDelete={() => handleDeleteCompany(company._id || "")}
                module="BusinessManagement"
                subModule="Company"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 flex-1 flex flex-col gap-2">
          <div className="space-y-1">
            {(company.city || company.state || company.pincode) && (
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 leading-relaxed text-xs">
                  {[company.city, company.state, company.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            <div className="flex items-start text-sm">
              <Mail className="w-4 h-4 text-gray-800 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 break-words leading-relaxed text-xs">
                {company.email}
              </span>
            </div>
            {company.mobile && (
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 text-xs">
                  {company.mobile}
                </span>
              </div>
            )}
          </div>

          {(company.gstNumber || company.vatNumber || company.tanNumber) && (
            <div className="pt-2 border-t border-gray-100">
              <div className="space-y-1.5">
                {company.country === "India" ? (
                  <>
                    {company.gstNumber && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                          GSTIN
                        </span>
                        <span className="bg-teal-50 text-teal-800 px-2 py-1 rounded font-mono text-xs border border-teal-100">
                          {company.gstNumber}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {company.vatNumber && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                          VAT
                        </span>
                        <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded font-mono text-xs border border-blue-100">
                          {company.vatNumber}
                        </span>
                      </div>
                    )}
                    {company.tanNumber && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                          TAN
                        </span>
                        <span className="bg-indigo-50 text-indigo-800 px-2 py-1 rounded font-mono text-xs border border-indigo-100">
                          {company.tanNumber}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CreditCard className="w-3 h-3 text-gray-500 mr-1.5" />
                <span className="text-gray-700 font-medium text-xs">
                  {company.defaultCurrency}
                </span>
              </div>
              {company.banks.length > 0 && (
                <div className="flex items-center text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                  <span className="font-medium">
                    {company.banks.length} Bank
                    {company.banks.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

  const downloadPDF = async () => {
    const res = await api.downloadCompanyPDF();
    console.log(res, "pdfresss");
  };

  return (
    <>
      <div className="custom-container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <HeaderGradient
            title="Company Management"
            subtitle="Manage your company information and registrations"
          />
          <div className="flex gap-2">
            <CheckAccess
              module="BusinessManagement"
              subModule="Company"
              type="create"
            >
              <Button
                onClick={() => {
                  resetForm();
                  setOpen(true);
                }}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                Add Company
                <Building2 className="w-4 h-4" />
              </Button>
            </CheckAccess>
            <Button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-3 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
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
                  <p className="text-teal-100 text-sm font-medium">
                    Total Companies
                  </p>
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
                  <p className="text-blue-100 text-sm font-medium">
                    GST Registered
                  </p>
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
                  <p className="text-green-100 text-sm font-medium">
                    MSME Registered
                  </p>
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
            setSearchTerm("");
            setStatusFilter("all");
            setSortBy("dateDesc");
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
            {viewMode === "table" ? <TableView /> : <CardView />}
            <p></p>
            <PaginationControls
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pagination={pagination}
              itemName="companies"
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
              title={editingCompany ? "Edit Company" : "Add New Company"}
              subtitle={
                editingCompany
                  ? "Update the company details"
                  : "Complete company registration information"
              }
              showCompany={false}
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
                      <label className="text-sm font-semibold text-gray-700">
                        Default Currency
                      </label>
                      <select
                        value={formData.defaultCurrency}
                        onChange={(e) =>
                          handleSelectChange("defaultCurrency", e.target.value)
                        }
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

                  <CustomInputBox
                    label="Code"
                    placeholder="e.g., ABC001"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                  />

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
                  <div className="grid grid-cols-1 gap-6">
                    <CustomInputBox
                      label="Mobile Number"
                      placeholder="e.g., +1-234-567-8900"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                    <CustomInputBox
                      label="Telephone"
                      placeholder="e.g., +1-234-567-8900"
                      name="telephone"
                      value={formData.telephone}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {formData.country === "India" ? (
                      <>
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
                        <CustomInputBox
                          label="VAT Number"
                          placeholder="e.g., ABCD12345E"
                          name="vatNumber"
                          value={formData.vatNumber}
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
                      </>
                    ) : (
                      <>
                        <CustomInputBox
                          label="VAT Number"
                          placeholder="e.g., ABCD12345E"
                          name="vatNumber"
                          value={formData.vatNumber}
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
                      </>
                    )}
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
                      <h4 className="font-medium text-teal-700">
                        Added Banks:
                      </h4>
                      {formData.banks.map((bank) => (
                        <div
                          key={bank.id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-200"
                        >
                          <div>
                            <p className="font-medium">{bank.bankName}</p>
                            <p className="text-sm text-gray-600">
                              {bank.accountHolderName} -{" "}
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
                    totalSteps={6}
                    onPrevious={() => setActiveTab("registration")}
                    onNext={() => setActiveTab("branding")}
                  />
                </div>
              )}

              {activeTab === "branding" && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                      Company Logo
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
                            alt="Company Logo"
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
                      {["GST", "PAN", "TAN", "MSME", "UDYAM"].map((docType) => (
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
                          <label
                            htmlFor={`${docType.toLowerCase()}-doc`}
                            className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors p-4 rounded-lg"
                          >
                            <Upload className="w-6 h-6 text-blue-500" />
                            <p className="text-sm text-gray-600">Upload</p>
                          </label>
                          {formData.registrationDocs.find(
                            (doc) => doc.type === docType
                          ) && (
                            <div className="mt-4 w-full">
                              <p className="text-xs text-gray-500 truncate mb-2">
                                {
                                  formData.registrationDocs.find(
                                    (doc) => doc.type === docType
                                  )?.fileName
                                }
                              </p>
                              {formData.registrationDocs.find(
                                (doc) => doc.type === docType
                              )?.previewUrl &&
                                docType !== "PDF" && (
                                  <img
                                    src={
                                      formData.registrationDocs.find(
                                        (doc) => doc.type === docType
                                      )?.previewUrl
                                    }
                                    alt={`${docType} document`}
                                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-75"
                                    onClick={() =>
                                      setViewingImage(
                                        formData.registrationDocs.find(
                                          (doc) => doc.type === docType
                                        )!
                                      )
                                    }
                                  />
                                )}
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 w-6 h-6 rounded-full"
                                onClick={() =>
                                  removeDocument(
                                    formData.registrationDocs.find(
                                      (doc) => doc.type === docType
                                    )!.id
                                  )
                                }
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Company Status
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
                        Book Starting Date
                      </label>
                      <input
                        type="date"
                        name="bookStartingDate"
                        value={formData.bookStartingDate}
                        onChange={handleChange}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Financial Date
                      </label>
                      <input
                        type="date"
                        name="financialDate"
                        value={formData.financialDate}
                        onChange={handleChange}
                        className="h-11 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between border px-2 py-2 mb-6">
                    <CheckboxWithLabel
                      title="Maintain Godown"
                      onChange={(e) =>
                        handleCheckSelectChange(
                          "maintainGodown",
                          e.target.checked
                        )
                      }
                      checked={formData.maintainGodown}
                    />
                    <CheckboxWithLabel
                      title="Maintain Batch"
                      onChange={(e) =>
                        handleCheckSelectChange(
                          "maintainBatch",
                          e.target.checked
                        )
                      }
                      checked={formData.maintainBatch}
                    />
                    <CheckboxWithLabel
                      title="Closing Quantity Order"
                      onChange={(e) =>
                        handleCheckSelectChange(
                          "closingQuantityOrder",
                          e.target.checked
                        )
                      }
                      checked={formData.closingQuantityOrder}
                    />
                    <CheckboxWithLabel
                      title="Negative Order"
                      onChange={(e) =>
                        handleCheckSelectChange(
                          "negativeOrder",
                          e.target.checked
                        )
                      }
                      checked={formData.negativeOrder}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 mb-2">
                      Internal Notes
                    </label>
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
                    submitLabel={
                      editingCompany ? "Update Company" : "Save Company"
                    }
                    isLastStep={true}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Image viewing modal */}
        <ImagePreviewDialog
          viewingImage={viewingImage}
          onClose={() => setViewingImage(null)}
        />
      </div>
      {companies && (
        <CompanySelectorModal
          open={showCompanyPopup}
          companies={companies}
          defaultSelected={defaultSelected}
          onSelect={handleSelect}
          onClose={() => setShowCompanyPopup(false)}
          onConfirmNavigate={() => {
            setShowCompanyPopup(false);
          }}
        />
      )}
    </>
  );
};

export default CompanyPage;
