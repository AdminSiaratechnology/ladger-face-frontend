import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTemplateStore } from "../../../store/templateStore";
import { useLedgerStore } from "../../../store/ladgerStore";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Copy,
  Check,
  Eye,
  Save,
  X,
  Settings,
  Layout,
  Calendar,
  List,
  Hash,
  DollarSign,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  CalendarDays,
  Calculator,
  ChevronRight,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PrinterIcon,
  Settings as SettingsIcon,
  FileInput,
  Building,
  User,
  Trash,
  Trash2Icon,
  Info,
} from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ViewModeToggle from "../customComponents/ViewModeToggle";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ScrollArea } from "../ui/scroll-area";
import CustomFormDialogHeader from "../customComponents/CustomFromDialogHeader";
import { SelectBasedLedger } from "../customComponents/SearchableLedgerSelect";
import { useCompanyStore } from "../../../store/companyStore";
import SelectedCompany from "../customComponents/SelectedCompany";
import CustomInputBox from "../customComponents/CustomInputBox";
import { DatePickerField } from "../customComponents/DatePickerField";
import PaginationControls from "../customComponents/CustomPaginationControls";
import HeaderGradient from "../customComponents/HeaderGradint";
import { TableViewSkeleton } from "../customComponents/TableViewSkeleton";
import FilterBar from "../customComponents/FilterBar";
import MultiStepNav from "../customComponents/MultiStepNav";
import CustomStepNavigation from "../customComponents/CustomStepNavigation";

type TemplateLedger = {
  ledgerId: string;
  ledgerName: string; // For display purposes
  condition: "autoCalculated" | "flatRate";
  amount: number;
  serialNo: number; // Auto-generated serial number for ledger
};

type TemplateType = {
  _id?: string;
  clientId?: string;
  companyId?: string;
  templateName: string;
  description?: string;
  ledgers: TemplateLedger[];
  applicableFrom: string;
  applicableTo?: string;
  serialNo: number;
  layout?: {
    headerTitle: string;
    footerNote: string;
    termsAndConditions: string;
    showSignature: boolean;
    signatureLabel: string;
    showEndOfListNote: boolean;
    endOfListNote: string;
    printFormat: "A4" | "A5" | "80mm";
    orientation: "portrait" | "landscape";
    margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  isDefault?: boolean;
  status?: "active" | "inactive";
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};
const TemplateCardView = ({
  templates,
  handleEdit,
  setIsDeleteDialogOpen,
  setTemplateToDelete,
  getStatusBadge,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates?.map((template) => (
        <Card
          key={template._id}
          className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group"
        >
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-gray-800 mb-1 line-clamp-1">
                    {template.templateName}
                  </CardTitle>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="h-7 w-7 p-0 hover:bg-white/50 text-blue-600 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTemplateToDelete(template._id);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="h-7 w-7 p-0 hover:bg-white/50 text-red-600 cursor-pointer"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {template.isDefault && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                  Default
                </Badge>
              )}
              {getStatusBadge(template.status || "active")}
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <div>
                  <span className="text-gray-600">
                    From:{" "}
                    {new Date(template.applicableFrom).toLocaleDateString()}
                  </span>
                  {template.applicableTo && (
                    <div className="text-gray-500 text-xs mt-0.5">
                      To: {new Date(template.applicableTo).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center text-sm">
                <PrinterIcon className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {template.layout?.printFormat || "A4"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {template.layout?.orientation || "portrait"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <CreditCard className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-gray-600">
                  {template.ledgers?.length || 0} ledger(s) configured
                </span>
              </div>

              {template.layout?.headerTitle && (
                <div className="flex items-center text-sm">
                  <Settings className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 truncate text-sm">
                    Header: {template.layout.headerTitle}
                  </span>
                </div>
              )}
            </div>

            {template.ledgers && template.ledgers.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Configured Ledgers
                </p>
                <div className="space-y-2">
                  {template.ledgers.slice(0, 2).map((ledger, index) => (
                    <div
                      key={index}
                      className="text-xs bg-gray-50 p-2 rounded border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate">
                          {ledger?.ledgerId?.ledgerName ||
                            ledger.ledgerName ||
                            `Ledger ${index + 1}`}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            ledger.condition === "autoCalculated"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {ledger.condition === "autoCalculated"
                            ? "Auto"
                            : "Fixed"}
                        </Badge>
                      </div>
                      {ledger.condition === "flatRate" && ledger.amount > 0 && (
                        <div className="text-gray-600 mt-1 text-xs">
                          ₹{ledger.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                  {template.ledgers.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{template.ledgers.length - 2} more ledgers
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const CardViewSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card
        key={i}
        className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden animate-pulse"
      >
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

// Empty state for card view
const CardViewEmptyState = ({ setIsDialogOpen }) => (
  <div className="text-center py-16">
    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-medium text-gray-900 mb-2">
      No templates found
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Create your first template to streamline your document generation process
    </p>
    <Button
      onClick={() => setIsDialogOpen(true)}
      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 cursor-pointer"
    >
      <Plus className="w-4 h-4 mr-2" /> Create Template
    </Button>
  </div>
);
const TemplatePreview = ({ template }: { template: TemplateType }) => {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const paperSizes = {
    A4: { width: "210mm", height: "297mm" },
    A5: { width: "148mm", height: "210mm" },
    "80mm": { width: "80mm", height: "auto" },
  };

  const getPaperSize = () => {
    const format = template.layout?.printFormat || "A4";
    return paperSizes[format];
  };

  const handleGeneratePDF = () => {
    toast.info(
      "PDF generation would be implemented with jsPDF/html2pdf in production"
    );
  };

  const handlePrint = () => {
    toast.info("Opening print dialog...");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    const margin = template.layout?.margin || {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    };
    const format = template.layout?.printFormat || "A4";
    const orientation = template.layout?.orientation || "portrait";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.templateName}</title>
          <style>
            @page {
              size: ${format} ${orientation};
              margin: ${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${
      margin.left
    }mm;
            }
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif; 
              font-size: ${format === "80mm" ? "10px" : "12px"};
            }
            .print-container { 
              width: ${format === "80mm" ? "80mm" : "100%"}; 
              min-height: ${format === "80mm" ? "auto" : "297mm"}; 
              background: white; 
              margin: 0 auto;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              ${format === "80mm" ? "padding: 5px;" : "padding: 20px;"}
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              font-size: ${format === "80mm" ? "8px" : "10px"}; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
              font-size: ${format === "80mm" ? "9px" : "11px"};
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: ${format === "80mm" ? "3px 5px" : "8px"}; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            h1 { 
              font-size: ${format === "80mm" ? "14px" : "24px"}; 
              margin: 0; 
            }
            .content { 
              ${format === "80mm" ? "padding: 5px;" : "padding: 20px;"}
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header">
              <h1>${template.layout?.headerTitle || "INVOICE"}</h1>
              <p><strong>Print Format:</strong> ${format} ${orientation}</p>
            </div>
            
            <div class="content">
              <p><strong>Template:</strong> ${template.templateName}</p>
              <p><strong>Applicable From:</strong> ${new Date(
                template.applicableFrom
              ).toLocaleDateString()}</p>
              ${
                template.applicableTo
                  ? `<p><strong>Applicable To:</strong> ${new Date(
                      template.applicableTo
                    ).toLocaleDateString()}</p>`
                  : ""
              }
              
              <h3>Ledgers:</h3>
              <table>
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Ledger Name</th>
                    <th>Condition</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${template.ledgers
                    .map(
                      (ledger) => `
                    <tr>
                      <td>${ledger.serialNo || "-"}</td>
                      <td>${ledger?.ledgerId?.ledgerName}</td>
                      <td>${
                        ledger.condition === "autoCalculated"
                          ? "Auto Calculated"
                          : "Flat Rate"
                      }</td>
                      <td>${
                        ledger.condition === "flatRate"
                          ? `₹${ledger.amount}`
                          : "Auto-calculated"
                      }</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              
              ${
                template.layout?.termsAndConditions
                  ? `
                <h3>Terms & Conditions:</h3>
                <p>${template.layout.termsAndConditions}</p>
              `
                  : ""
              }
            </div>
            
            <div class="footer">
              <p>${
                template.layout?.footerNote || "Thank you for your business!"
              }</p>
              ${
                template.layout?.showSignature
                  ? `
                <div style="margin-top: ${
                  format === "80mm" ? "20px" : "50px"
                };">
                  <div style="width: ${
                    format === "80mm" ? "100px" : "200px"
                  }; border-bottom: 1px solid #000; margin: 0 auto 5px;"></div>
                  <p>${
                    template.layout?.signatureLabel || "Authorized Signatory"
                  }</p>
                </div>
              `
                  : ""
              }
              ${
                template.layout?.showEndOfListNote
                  ? `
                <p style="margin-top: 10px; font-style: italic; font-size: ${
                  format === "80mm" ? "8px" : "10px"
                };">${template.layout.endOfListNote}</p>
              `
                  : ""
              }
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const previewId = `template-preview-${Date.now()}`;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between p-4 border-b bg-gray-50 gap-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="h-8 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="h-8 cursor-pointer"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <PrinterIcon className="w-4 h-4" />
            <span>Format: {template.layout?.printFormat || "A4"}</span>
            <span>•</span>
            <span>
              Orientation: {template.layout?.orientation || "portrait"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-4 gap-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="h-8 w-8 p-0 cursor-pointer"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-16 text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              className="h-8 w-8 p-0 cursor-pointer"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer"
            onClick={handleGeneratePDF}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4" id={previewId}>
        <div className="flex justify-center">
          <div
            className="bg-white shadow-xl border-0"
            style={{
              width: viewMode === "mobile" ? "90%" : getPaperSize().width,
              minHeight: getPaperSize().height,
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              fontSize:
                template.layout?.printFormat === "80mm" ? "10px" : "12px",
            }}
          >
            <div
              className="p-4"
              style={{
                padding:
                  template.layout?.printFormat === "80mm" ? "10px" : "20px",
                marginTop: template.layout?.margin?.top
                  ? `${template.layout.margin.top}mm`
                  : "10mm",
                marginBottom: template.layout?.margin?.bottom
                  ? `${template.layout.margin.bottom}mm`
                  : "10mm",
                marginLeft: template.layout?.margin?.left
                  ? `${template.layout.margin.left}mm`
                  : "10mm",
                marginRight: template.layout?.margin?.right
                  ? `${template.layout.margin.right}mm`
                  : "10mm",
              }}
            >
              <div className="text-center mb-4">
                <h1
                  className="text-xl font-bold"
                  style={{
                    fontSize:
                      template.layout?.printFormat === "80mm" ? "14px" : "24px",
                  }}
                >
                  {template.layout?.headerTitle || "INVOICE"}
                </h1>

                <p className="text-xs text-gray-500 mt-1">
                  Format: {template.layout?.printFormat || "A4"} • Orientation:{" "}
                  {template.layout?.orientation || "portrait"}
                </p>
              </div>

              <div className="mb-4">
                <h2 className="text-sm font-semibold mb-1">
                  {template.templateName}
                </h2>
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>Applicable From:</strong>{" "}
                    {new Date(template.applicableFrom).toLocaleDateString()}
                  </p>
                  {template.applicableTo && (
                    <p>
                      <strong>Applicable To:</strong>{" "}
                      {new Date(template.applicableTo).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">
                  Ledger Configuration
                </h3>
                <div className="border rounded overflow-hidden">
                  <table
                    className="w-full"
                    style={{
                      fontSize:
                        template.layout?.printFormat === "80mm"
                          ? "9px"
                          : "11px",
                    }}
                  >
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-1 text-left font-medium">SN</th>
                        <th className="p-1 text-left font-medium">
                          Ledger Name
                        </th>
                        <th className="p-1 text-left font-medium">Condition</th>
                        <th className="p-1 text-left font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.ledgers.map((ledger, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-1">
                            {ledger.serialNo || index + 1}
                          </td>
                          <td className="p-1">
                            {ledger?.ledgerId?.ledgerName}
                          </td>
                          <td className="p-1">
                            <Badge
                              variant={
                                ledger.condition === "autoCalculated"
                                  ? "secondary"
                                  : "default"
                              }
                              className="text-xs"
                            >
                              {ledger.condition === "autoCalculated"
                                ? "Auto Calculated"
                                : "Flat Rate"}
                            </Badge>
                          </td>
                          <td className="p-1">
                            {ledger.condition === "flatRate"
                              ? `₹${ledger.amount}`
                              : "Auto-calculated"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {template.layout?.termsAndConditions && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1">
                    Terms & Conditions
                  </h3>
                  <div className="p-2 border rounded bg-gray-50">
                    <p className="whitespace-pre-line text-xs">
                      {template.layout.termsAndConditions}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                  <div className="text-xs text-gray-600">
                    <p>
                      {template.layout?.footerNote ||
                        "Thank you for your business!"}
                    </p>
                  </div>

                  {template.layout?.showSignature && (
                    <div className="text-center">
                      <div className="mb-1">
                        <div className="w-32 h-1 border-b border-gray-400 mx-auto"></div>
                      </div>
                      <p className="text-xs font-medium">
                        {template.layout?.signatureLabel}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TemplateManagement() {
  const {
    templates,
    pagination,
    fetchTemplates,
    filterTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    loading,
  } = useTemplateStore();
  const { ledgers, fetchLedgers } = useLedgerStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateType | null>(
    null
  );
  const [editingTemplate, setEditingTemplate] = useState<TemplateType | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { defaultSelected } = useCompanyStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "nameAsc" | "nameDesc" | "dateAsc" | "dateDesc"
  >("dateDesc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const defaultFormState: TemplateType = {
    templateName: "",
    description: "",
    ledgers: [
      {
        ledgerId: "",
        ledgerName: "",
        condition: "autoCalculated",
        amount: 0,
        serialNo: 1,
      },
    ],
    serialNo: 1,
    companyId: defaultSelected?._id,
    applicableFrom: new Date().toISOString().split("T")[0],
    applicableTo: "",
    layout: {
      headerTitle: "INVOICE",
      footerNote: "",
      termsAndConditions: "",
      showSignature: true,
      signatureLabel: "Authorized Signatory",
      printFormat: "A4",
      orientation: "portrait",
      margin: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    isDefault: false,
    status: "active",
  };
  const containerRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<TemplateType>(defaultFormState);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!defaultSelected?._id) return;

    fetchTemplates({
      page: currentPage,
      limit: 10,
      searchTerm: debouncedSearch,
      sortBy,
      statusFilter,
      companyId: defaultSelected._id,
    });
  }, [currentPage, defaultSelected, debouncedSearch, sortBy, statusFilter]);

  useEffect(() => {
    if (!isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (!isPreviewDialogOpen) {
      setPreviewTemplate(null);
    }
  }, [isPreviewDialogOpen]);

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      setTemplateToDelete(null);
    }
  }, [isDeleteDialogOpen]);

  const resetForm = useCallback(() => {
    setFormState(defaultFormState);
    setEditingTemplate(null);
    setActiveTab("general");
    setIsLoading(false);
  }, [defaultFormState]);

  const handleEdit = useCallback(
    (template: TemplateType) => {
      const templateData = {
        ...defaultFormState,
        ...template,
        applicableFrom: template.applicableFrom
          ? new Date(template.applicableFrom).toISOString().split("T")[0]
          : defaultFormState.applicableFrom,
        applicableTo: template.applicableTo
          ? new Date(template.applicableTo).toISOString().split("T")[0]
          : "",
        layout: {
          ...defaultFormState.layout,
          ...(template.layout || {}),
        },
        ledgers: [
          ...(template.ledgers || []),
          {
            ledgerId: "",
            ledgerName: "",
            condition: "autoCalculated",
            amount: 0,
            serialNo: (template.ledgers?.length || 0) + 1,
          },
        ],
      };

      setEditingTemplate(template);
      setFormState(templateData);
      setIsDialogOpen(true);
    },
    [defaultFormState]
  );

  const handlePreview = useCallback((template: TemplateType) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  }, []);

  const handleDuplicate = useCallback((template: TemplateType) => {
    const duplicated = {
      ...template,
      _id: undefined,
      templateName: `${template.templateName} (Copy)`,
      isDefault: false,
      serialNo: 1,
    };
    setFormState(duplicated);
    setEditingTemplate(null);
    setIsDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formState.templateName) {
      return toast.error("Template name is required");
    }
    setIsLoading(true);
    try {
      const cleanLedgers = formState.ledgers.filter((l) => {
        if (!l.ledgerId) return false;
        return l.ledgerId.toString().trim() !== "";
      });

      const templateData = {
        ...formState,
        ledgers: cleanLedgers,
        applicableFrom: new Date(formState.applicableFrom).toISOString(),
        applicableTo: formState.applicableTo
          ? new Date(formState.applicableTo).toISOString()
          : undefined,
      };

      if (editingTemplate?._id) {
        await updateTemplate({
          id: editingTemplate._id,
          template: templateData,
        });
      } else {
        await addTemplate(templateData);
      }

      setIsDialogOpen(false);
      await fetchTemplates({
        page: currentPage,
        limit: 10,
        searchTerm: "",
        sortBy,
        statusFilter: "all",
        companyId: defaultSelected?._id,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteTemplate(id);
      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchTemplates(currentPage, 10, defaultSelected?._id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete template");
    } finally {
      setIsLoading(false);
    }
  };

  const addLedger = () => {
    const newLedgers = [...formState.ledgers];
    newLedgers.push({
      ledgerId: "",
      ledgerName: "",
      condition: "autoCalculated",
      amount: 0,
      serialNo: newLedgers.length + 1,
    });
    setFormState({ ...formState, ledgers: newLedgers });
  };

  const updateLedger = (index: number, ledger: Partial<TemplateLedger>) => {
    const newLedgers = [...formState.ledgers];
    newLedgers[index] = { ...newLedgers[index], ...ledger };

    if (ledger.ledgerId && ledger.ledgerId !== newLedgers[index].ledgerId) {
      const selectedLedger = ledgers.find((l) => l._id === ledger.ledgerId);
      if (selectedLedger) {
        newLedgers[index].ledgerName = selectedLedger.name;
      }
    }

    setFormState({ ...formState, ledgers: newLedgers });
  };

  const removeLedger = (index: number) => {
    const newLedgers = [...formState.ledgers];
    newLedgers.splice(index, 1);
    const updatedLedgers = newLedgers.map((ledger, idx) => ({
      ...ledger,
      serialNo: idx + 1,
    }));
    setFormState({ ...formState, ledgers: updatedLedgers });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge
        variant="secondary"
        className={`${
          status === "active"
            ? "bg-green-200 text-green-700"
            : "bg-red-100 text-red-700"
        } hover:bg-green-100 text-xs py-1 px-3 capitalize`}
      >
        {status}
      </Badge>
    );
  };

  const moveLedger = (index: number, direction: "up" | "down") => {
    const newLedgers = [...formState.ledgers];
    if (direction === "up" && index > 0) {
      [newLedgers[index], newLedgers[index - 1]] = [
        newLedgers[index - 1],
        newLedgers[index],
      ];
    } else if (direction === "down" && index < newLedgers.length - 1) {
      [newLedgers[index], newLedgers[index + 1]] = [
        newLedgers[index + 1],
        newLedgers[index],
      ];
    }
    const updatedLedgers = newLedgers.map((ledger, idx) => ({
      ...ledger,
      serialNo: idx + 1,
    }));
    setFormState({ ...formState, ledgers: updatedLedgers });
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  };

  const handlePreviewDialogClose = () => {
    setIsPreviewDialogOpen(false);
  };

  const handleDeleteDialogCancel = () => {
    setIsDeleteDialogOpen(false);
  };
  const steps = [
    { id: "general", label: "General" },
    { id: "ledgers", label: "Ledgers" },
    { id: "layout", label: "Layout & Print" },
  ];

  const stepIcons = {
    general: <Settings className="w-3 h-3" />,
    ledgers: <CreditCard className="w-3 h-3" />,
    layout: <SettingsIcon className="w-3 h-3" />,
  };
  const validateStep = (stepId: string) => {
    if (stepId === "general") {
      if (!formState.templateName.trim()) {
        toast.error("Template Name is required");
        return false;
      }
    }

    return true;
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center">
        <HeaderGradient
          title="Template Management"
          subtitle="Manage your company templates here."
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" /> New Template
            </Button>
          </DialogTrigger>
          <DialogContent
            className="custom-dialog-container max-w-4xl"
            onInteractOutside={(e) => {
              if (isLoading) {
                e.preventDefault();
              }
            }}
          >
            <DialogHeader className="pb-2">
              <CustomFormDialogHeader
                title={editingTemplate ? "Edit Template" : "Add New Template"}
                subtitle={
                  editingTemplate
                    ? "Update the company details"
                    : "Complete company registration information"
                }
              />
            </DialogHeader>

            <div className="mb-6">
              <MultiStepNav
                steps={steps}
                currentStep={activeTab}
                onStepChange={(nextStep) => {
                  // Validate current step before changing
                  if (!validateStep(activeTab)) return;

                  setActiveTab(nextStep);
                }}
                stepIcons={stepIcons}
                scrollContainerRef={containerRef}
              />
            </div>

            <ScrollArea className="h-[60vh] pr-4" ref={containerRef}>
              <div
                className={`space-y-6 py-4 ${
                  activeTab !== "general" ? "hidden" : ""
                }`}
              >
                <Card>
                  <CardContent className="space-y-4 mt-2">
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <CustomInputBox
                          label="Template Name"
                          placeholder="Template Name *"
                          name="templateName"
                          value={formState.templateName}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              templateName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <SelectedCompany />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <DatePickerField
                          name="applicableFrom"
                          label="Applicable From"
                          value={formState.applicableFrom}
                          onChange={(e) => {
                            const newFrom = e.target.value;

                            setFormState((prev) => {
                              let updatedTo = prev.applicableTo;

                              if (
                                updatedTo &&
                                new Date(updatedTo) < new Date(newFrom)
                              ) {
                                updatedTo = "";
                              }

                              return {
                                ...prev,
                                applicableFrom: newFrom,
                                applicableTo: updatedTo,
                              };
                            });
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <DatePickerField
                          name="applicableTo"
                          label="Applicable To"
                          value={formState.applicableTo}
                          minDate={
                            formState.applicableFrom
                              ? new Date(formState.applicableFrom)
                              : new Date()
                          }
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              applicableTo: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-3">
                        <Label htmlFor="status" className="text-sm font-medium">
                          Status
                        </Label>
                        <Select
                          value={formState.status}
                          onValueChange={(val: "active" | "inactive") =>
                            setFormState({ ...formState, status: val })
                          }
                        >
                          <SelectTrigger className="w-50 h-11">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                        <Switch
                          checked={formState.isDefault}
                          onCheckedChange={(checked) =>
                            setFormState({ ...formState, isDefault: checked })
                          }
                        />
                        <div>
                          <Label className="text-sm font-medium">
                            Set as Default Template
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div
                className={`space-y-6 py-4 ${
                  activeTab !== "ledgers" ? "hidden" : ""
                }`}
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="rounded-md border overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-100 border-b font-medium text-sm text-gray-700">
                        <div className="col-span-1">S.no.</div>
                        <div className="col-span-4">Ledger</div>
                        <div className="col-span-3">Condition</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>

                      <div className="divide-y">
                        {formState.ledgers.map((ledger, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition"
                          >
                            <div className="col-span-1 font-medium text-gray-700">
                              {index + 1}
                            </div>

                            <div className="col-span-4">
                              <SelectBasedLedger
                                value={ledger.ledgerId}
                                onValueChange={(val, name) => {
                                  updateLedger(index, {
                                    ledgerId: val,
                                    ledgerName: name,
                                  });

                                  if (index === formState.ledgers.length - 1) {
                                    setFormState((prev) => ({
                                      ...prev,
                                      ledgers: [
                                        ...prev.ledgers,
                                        {
                                          ledgerId: "",
                                          ledgerName: "",
                                          condition: "autoCalculated",
                                          amount: 0,
                                        },
                                      ],
                                    }));
                                  }
                                }}
                                companyId={defaultSelected?._id}
                                placeholder="Select ledger"
                              />
                            </div>

                            <div className="col-span-3">
                              <Select
                                value={ledger.condition}
                                onValueChange={(val) =>
                                  updateLedger(index, { condition: val })
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="autoCalculated">
                                    Auto Calculated
                                  </SelectItem>
                                  <SelectItem value="flatRate">
                                    Flat Rate
                                  </SelectItem>
                                  <SelectItem value="percentage">
                                    Percentage
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <div className="relative">
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={
                                    ledger.amount === 0 ? "" : ledger.amount
                                  }
                                  onChange={(e) =>
                                    updateLedger(index, {
                                      amount:
                                        e.target.value === ""
                                          ? ""
                                          : parseFloat(e.target.value),
                                    })
                                  }
                                  disabled={
                                    ledger.condition === "autoCalculated"
                                  }
                                  placeholder="0.00"
                                  className={`
        ${ledger.condition === "autoCalculated" ? "bg-gray-100" : "bg-white"}
        ${ledger.condition === "percentage" ? "pr-10" : ""}
      `}
                                />
                                {ledger.condition === "percentage" && (
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                                    %
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="col-span-2 flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLedger(index)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formState.ledgers.some(
                      (l) => l.condition === "autoCalculated"
                    ) && (
                      <div className="mt-4 text-sm text-gray-500 flex items-center px-4 pb-4">
                        <Info className="w-4 h-4 mr-2" />
                        Auto Calculated ledgers will have their amounts
                        calculated automatically.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div
                className={`space-y-6 py-4 ${
                  activeTab !== "layout" ? "hidden" : ""
                }`}
              >
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Header Title
                        </Label>
                        <Input
                          id="headerTitle"
                          value={formState.layout?.headerTitle || ""}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              layout: {
                                ...formState.layout!,
                                headerTitle: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g., INVOICE, QUOTATION"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Footer Note
                        </Label>
                        <Input
                          id="footerNote"
                          value={formState.layout?.footerNote || ""}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              layout: {
                                ...formState.layout!,
                                footerNote: e.target.value,
                              },
                            })
                          }
                          placeholder="Thank you for your business!"
                        />
                      </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Terms & Conditions
                      </Label>
                      <CustomInputBox
                        id="termsAndConditions"
                        name="termsAndConditions"
                        type="richtext"
                        value={formState.layout?.termsAndConditions || ""}
                        onChange={(value) => {
                          if (typeof value === "string") {
                            setFormState({
                              ...formState,
                              layout: {
                                ...formState.layout!,
                                termsAndConditions: value,
                              },
                            });
                          }
                        }}
                        placeholder="Enter your terms and conditions..."
                        richTextConfig={{
                          minHeight: "110px",
                          toolbar: [
                            ["bold", "italic", "underline"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ header: [1, 2, 3, false] }],
                            [{ color: [] }, { background: [] }],
                            ["link"],
                            ["clean"],
                          ],
                        }}
                      />
                    </div>

                    {/* Signature Label */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Signature Label
                        </Label>
                        <Input
                          id="signatureLabel"
                          value={
                            formState.layout?.signatureLabel ||
                            "Authorized Signatory"
                          }
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              layout: {
                                ...formState.layout!,
                                signatureLabel: e.target.value,
                              },
                            })
                          }
                          placeholder="Authorized Signatory"
                        />
                      </div>
                    </div>

                    {/* Signature Toggle */}
                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label className="text-sm font-medium">
                            Show Signature
                          </Label>
                          <p className="text-xs text-gray-500">
                            Display signature field
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formState.layout?.showSignature}
                        onCheckedChange={(checked) =>
                          setFormState({
                            ...formState,
                            layout: {
                              ...formState.layout!,
                              showSignature: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <Separator />

                    {/* Print Settings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-5 flex items-center">
                        <PrinterIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Print Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Print Format */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Print Format
                          </Label>
                          <Select
                            value={formState.layout?.printFormat || "A4"}
                            onValueChange={(val) =>
                              setFormState({
                                ...formState,
                                layout: {
                                  ...formState.layout!,
                                  printFormat: val,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select print format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4 (Standard)</SelectItem>
                              <SelectItem value="A5">
                                A5 (Half Sheet)
                              </SelectItem>
                              <SelectItem value="80mm">
                                80mm (Role Paper)
                              </SelectItem>
                              <SelectItem value="500mm">
                                500mm (Receipt)
                              </SelectItem>
                              <SelectItem value="58mm">
                                58mm (Receipt)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Orientation */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Orientation
                          </Label>
                          <Select
                            value={formState.layout?.orientation || "portrait"}
                            onValueChange={(val) =>
                              setFormState({
                                ...formState,
                                layout: {
                                  ...formState.layout!,
                                  orientation: val,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select orientation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait</SelectItem>
                              <SelectItem value="landscape">
                                Landscape
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Margins */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3">
                          Page Margins (mm)
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {["top", "bottom", "left", "right"].map((side) => (
                            <div key={side} className="space-y-2">
                              <Label className="text-xs capitalize">
                                {side}
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                value={formState.layout?.margin?.[side] || 10}
                                onChange={(e) =>
                                  setFormState({
                                    ...formState,
                                    layout: {
                                      ...formState.layout!,
                                      margin: {
                                        ...formState.layout!.margin,
                                        [side]: parseInt(e.target.value) || 10,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <div className="mt-2">
              <CustomStepNavigation
                currentStep={
                  steps.findIndex((step) => step.id === activeTab) + 1
                }
                totalSteps={steps.length}
                onNext={() => {
                  if (!validateStep(activeTab)) return; // ⛔ Block next step

                  const currentIndex = steps.findIndex(
                    (step) => step.id === activeTab
                  );
                  if (currentIndex < steps.length - 1) {
                    setActiveTab(steps[currentIndex + 1].id);
                  }
                }}
                onPrevious={() => {
                  const currentIndex = steps.findIndex(
                    (step) => step.id === activeTab
                  );
                  if (currentIndex > 0) {
                    setActiveTab(steps[currentIndex - 1].id);
                  }
                }}
                onSubmit={handleSave}
                isLastStep={activeTab === steps[steps.length - 1].id}
                showPrevious={activeTab !== steps[0].id}
                showNext={activeTab !== steps[steps.length - 1].id}
                submitLabel={
                  editingTemplate ? "Update Template" : "Create Template"
                }
                editing={!!editingTemplate}
              />
            </div>
          </DialogContent>
        </Dialog>
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
      {loading && viewMode === "table" && <TableViewSkeleton />}
      {loading && viewMode === "cards" && <CardViewSkeleton />}

      <ViewModeToggle
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalItems={pagination?.total}
      />

      {viewMode === "table" ? (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">Template</TableHead>
                <TableHead className="font-semibold">
                  Applicable Dates
                </TableHead>
                <TableHead className="font-semibold">Print Format</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((t) => (
                <TableRow key={t?._id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {t?.templateName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t?.description}
                        </div>
                        {t?.isDefault && (
                          <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Default
                          </Badge>
                        )}
                        {t?.ledgers && t?.ledgers?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {t?.ledgers?.length} ledger(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        From: {new Date(t?.applicableFrom).toLocaleDateString()}
                      </div>
                      {t?.applicableTo && (
                        <div className="text-sm text-gray-600">
                          To: {new Date(t?.applicableTo).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <PrinterIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {t?.layout?.printFormat || "A4"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {t?.layout?.orientation || "portrait"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(t?.status || "active")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(t)}
                        className="hover:bg-blue-50 text-blue-600 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTemplateToDelete(t._id!);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="hover:bg-red-50 text-red-600 cursor-pointer"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {templates.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No templates found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first template to get started
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create Template
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {pagination && pagination.totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pagination={pagination}
              itemName="templates"
            />
          )}
        </div>
      ) : (
        <div className="mt-6">
          {templates.length === 0 && !loading ? (
            <CardViewEmptyState setIsDialogOpen={setIsDialogOpen} />
          ) : (
            <TemplateCardView
              templates={templates}
              handleEdit={handleEdit}
              setIsDeleteDialogOpen={setIsDeleteDialogOpen}
              setTemplateToDelete={setTemplateToDelete}
              getStatusBadge={getStatusBadge}
            />
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pagination={pagination}
                itemName="templates"
              />
            </div>
          )}
        </div>
      )}

      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="custom-dialog-container">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-bold">
              Template Preview: {previewTemplate?.templateName}
            </DialogTitle>
            <DialogDescription>
              Previewing how your template will look with sample data
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewTemplate && <TemplatePreview template={previewTemplate} />}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={handlePreviewDialogClose}
              className="cursor-pointer"
            >
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={handleDeleteDialogCancel}
              disabled={isLoading}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => templateToDelete && handleDelete(templateToDelete)}
              disabled={isLoading}
              className="flex-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
