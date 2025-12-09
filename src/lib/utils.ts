import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// utils/exportToExcel.ts
import * as XLSX from "exceljs";
import { saveAs } from "file-saver";
interface CheckPermission {
  user?: any;
  companyId?: string; // 👈 added this
  module?: string;
  subModule?: string;
  type?: string;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkPermission({
  user,
  companyId,
  module,
  subModule,
  type,
}: CheckPermission) {
  if (!user) return false;
  // 🔓 If user has global/all permissions
  if (user.allPermissions) return true;

  // 🧱 Validate access array
  if (!user.access || user.access.length === 0) return false;

  // 🔍 Find access for the selected company
  const companyAccess = companyId
    ? user.access.find((a: any) => a.company?._id === companyId)
    : user.access[0]; // fallback if no companyId provided

  if (!companyAccess || !companyAccess.modules) return false;

  const moduleAccess = companyAccess.modules[module];
  const subModuleAccess = moduleAccess?.[subModule];
  if (!subModuleAccess) return false;

  if (type?.includes("|")) {
    const types = type.split("|").map((t) => t.trim());
    return types.some((t) => subModuleAccess[t]);
  }

  return subModuleAccess[type] === true;
}


type ReportType = "order" | "payment" | "customer-wise" | "product-wise";

interface ExportConfig {
  data: any[];
  type: ReportType;
  fileName?: string;
  isDetailed?: boolean;
}

const CONFIGS = {
  order: {
    title: "Order Report",
    columns: [
      { header: "Order Code", key: "code", width: 18 },
      { header: "Date", key: "date", width: 15 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Salesman", key: "salesman", width: 20 },
      { header: "Items", key: "items", width: 10 },
      { header: "Amount", key: "amount", width: 16 },
      { header: "Status", key: "status", width: 14 },
    ],
    map: (i: any) => ({
      code: i.orderCode || "-",
      date: new Date(i.createdAt || i.date).toLocaleDateString("en-IN"),
      customer: i.customerName || "N/A",
      salesman: i.salesmanName || "System",
      items: i.items?.length || 0,
      amount: `₹${(i.grandTotal || 0).toLocaleString("en-IN")}`,
      status: (i.status || "").toUpperCase(),
    }),
  },

  payment: {
    title: "Payment Report",
    columns: [
      { header: "Date", key: "date", width: 15 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Collected By", key: "collector", width: 20 },
      { header: "Amount", key: "amount", width: 16 },
      { header: "Mode", key: "mode", width: 14 },
      { header: "Status", key: "status", width: 14 },
      { header: "Remarks", key: "remarks", width: 35 },
    ],
    map: (i: any) => ({
      date: new Date(i.createdAt || i.date).toLocaleDateString("en-IN"),
      customer: i.customerName || "N/A",
      collector: i.salesmanName || i.userName || "System",
      amount: `₹${(i.paymentAmount || i.amount || 0).toLocaleString("en-IN")}`,
      mode: (i.mode || "unknown").replace("_", " ").toUpperCase(),
      status: (i.status || "").toUpperCase(),
      remarks: i.remarks || "Payment Received",
    }),
  },

  "customer-wise": {
    title: "Customer Wise Report",
    columns: [
      { header: "Date", key: "date", width: 15 },
      { header: "Customer", key: "customer", width: 28 },
      { header: "Salesman", key: "salesman", width: 22 },
      { header: "Type", key: "type", width: 12 },
      { header: "Bill Amount", key: "bill", width: 16 },
      { header: "Deposit Amount", key: "deposit", width: 16 },
      { header: "Status", key: "status", width: 14 },
      { header: "Remarks", key: "remarks", width: 35 },
    ],
    map: (i: any) => ({
      date: new Date(i.date).toLocaleDateString("en-IN"),
      customer: i.customerName || "Unknown",
      salesman: i.salesmanName || "System",
      type: i.type === "Order" ? "ORDER" : "PAYMENT",
      bill: i.orderAmount ? `₹${i.orderAmount.toLocaleString("en-IN")}` : "",
      deposit: i.paymentAmount ? `₹${i.paymentAmount.toLocaleString("en-IN")}` : "",
      status: (i.status || "").toUpperCase(),
      remarks: i.remarks || "-",
    }),
  },

  // NEW: Product-Wise Report
  "product-wise": {
    title: "Product Wise Report",
    columns: [
      { header: "Date", key: "date", width: 15 },
      { header: "HSN", key: "hsn", width: 14 },
      { header: "Product", key: "product", width: 30 },
      { header: "Salesman", key: "salesman", width: 22 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "Rate", key: "rate", width: 14 },
      { header: "Taxable", key: "taxable", width: 16 },
      { header: "CGST", key: "cgst", width: 12 },
      { header: "SGST", key: "sgst", width: 12 },
      { header: "IGST", key: "igst", width: 12 },
      { header: "VAT Rate", key: "vatRate", width: 12 },
      { header: "VAT Amount", key: "vatAmount", width: 14 },
      { header: "Total Amount", key: "total", width: 18 },
    ],
    map: (i: any) => ({
      date: new Date(i.date).toLocaleDateString("en-IN"),
      hsn: i.hsnCode || "-",
      product: i.productName || "Unknown Product",
      salesman: i.salesmanName || "System",
      qty: i.qty || 0,
      rate: `${(i.rate || 0).toLocaleString("en-IN")}`,
      taxable: `${(i.taxable || 0).toLocaleString("en-IN")}`,
      cgst: i.cgst > 0 ? `${i.cgst.toLocaleString("en-IN")}` : "",
      sgst: i.sgst > 0 ? `${i.sgst.toLocaleString("en-IN")}` : "",
      igst: i.igst > 0 ? `${i.igst.toLocaleString("en-IN")}` : "",
      vatRate: i.vatRate ? `${i.vatRate}%` : "",
      vatAmount: i.vatAmount > 0 ? `${i.vatAmount.toLocaleString("en-IN")}` : "",
      total: `${(i.total || 0).toLocaleString("en-IN")}`,
    }),
  },
};

export const exportToExcel = async ({
  data,
  type,
  fileName = "report",
  isDetailed = false,
}: ExportConfig) => {
  if (!data?.length) return alert("No data to export");

  const config = CONFIGS[type] || CONFIGS.order;

  const workbook = new XLSX.Workbook();
  const ws = workbook.addWorksheet(config.title);

  ws.columns = config.columns;

  // Title Row
  ws.insertRow(1, [config.title]);
  ws.mergeCells(`A1:${String.fromCharCode(64 + config.columns.length)}1`);
  const titleCell = ws.getCell("A1");
  titleCell.font = { size: 16, bold: true, color: { argb: "FF1E40AF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };

  // Data Rows
  data.forEach((item, index) => {
    const row = ws.addRow(config.map(item));
    if (index % 2 === 1) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
    }
  });

  // Header Style
  const headerRow = ws.getRow(2);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E40AF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // Auto-fit columns
  ws.columns.forEach(col => {
    col.width = col.width || 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/octet-stream" });
  const today = new Date().toISOString().split("T")[0];
  saveAs(blob, `${fileName}${isDetailed ? "_Detailed" : ""}_${today}.xlsx`);
};