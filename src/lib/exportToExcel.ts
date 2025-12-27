import * as XLSX from "xlsx";
import { toast } from "sonner";

// Type for the selected company (adjust if your store type is different)
export interface Company {
  _id?: string;
  namePrint?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstNumber?: string;
  email?: string;
  mobile?: string;
  telephone?: string;
  website?: string;
  defaultCurrency?: string;
  defaultCurrencySymbol?: string;
  notes?: string;
  maintainBatch?: boolean;
  maintainGodown?: boolean;
  negativeOrder?: boolean;
  closingQuantityOrder?: boolean;
}

// Props for the reusable export function
interface ExportToExcelProps<T> {
  data: T[];                          // Array of items (products, customers, etc.)
  company: Company | null;            // Selected company
  sheetName: string;                  // e.g. "Products", "Customers"
  fileNamePrefix: string;             // e.g. "products", "customers"
  tableHeaders: string[];             // Column headers for the data table
  rowMapper: (item: T) => (string | number)[]; // How to turn each item into a row
  title?: string;                     // Optional custom title, default = `${sheetName} List`
}

/**
 * Reusable function to export any list with company header to Excel (.xlsx)
 */
export const exportToExcel = <T>({
  data,
  company,
  sheetName,
  fileNamePrefix,
  tableHeaders,
  rowMapper,
  title,
}: ExportToExcelProps<T>) => {
  if (!company) {
    toast.error("No company selected");
    return;
  }

  if (data.length === 0) {
    toast.error(`No ${sheetName.toLowerCase()} found to export`);
    return;
  }

  /* ===============================
     COMPANY DETAILS SECTION
  =============================== */
  const address = [
    company.address1,
    company.address2,
    company.address3,
    company.city,
    company.state,
    company.pincode,
    company.country,
  ]
    .filter(Boolean)
    .join(", ");

  const companySection = [
    [`${title || sheetName} Export Report - ${new Date().toLocaleDateString()}`],
    [],
    ["COMPANY DETAILS"],
    [],
    ["Company Name", company.namePrint || "N/A"],
    ["Address", address || "N/A"],
    ["GST Number", company.gstNumber || "N/A"],
    ["Email", company.email || "N/A"],
    ["Mobile", company.mobile || "N/A"],
    ["Telephone", company.telephone || "N/A"],
    ["Website", company.website || "N/A"],
    [
      "Currency",
      `${company.defaultCurrency || ""} (${company.defaultCurrencySymbol || ""})`,
    ],
    ["Notes", company.notes || "N/A"],
    [],

    [`${title || sheetName} LIST (Total: ${data.length})`],
    [],
  ];

  /* ===============================
     DATA TABLE
  =============================== */
  const tableRows = data.map(rowMapper);

  const sheetData = [
    ...companySection,
    tableHeaders,
    ...tableRows,
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  /* ===============================
     STYLING
  =============================== */
  const headerRowIndex = companySection.length; // First row of table headers

  const range = XLSX.utils.decode_range(worksheet["!ref"]!);

  // Style the table header row
  for (let c = 0; c < tableHeaders.length; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: "0F766E" } }, // Teal background
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    }
  }

  // Auto-fit column widths
  worksheet["!cols"] = tableHeaders.map(() => ({ wch: 20 }));

  // Create workbook & download
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // Sheet name limit

  const safeCompanyName = (company.namePrint || "company")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  XLSX.writeFile(
    workbook,
    `${fileNamePrefix}_${safeCompanyName}_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`
  );

  toast.success(
    `${data.length} ${sheetName.toLowerCase()} exported with company details!`
  );
};