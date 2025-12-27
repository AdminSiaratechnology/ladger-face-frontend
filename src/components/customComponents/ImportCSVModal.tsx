import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {useCompanyStore} from "../../../store/companyStore"

interface ImportCSVModalProps<T = any> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;

  // Customization
  title: string; // e.g., "Import Products" or "Import Customers"
  resourceName: string; // e.g., "product" or "customer" (for toast messages)
  importFn: (formData: FormData) => Promise<{
    total: number;
    inserted: number;
    failed: number;
    errors?: string[];
    [key: string]: any;
  }>;

  // Optional: customize which columns to show in preview (by default shows all)
  displayColumns?: string[];
}

export const ImportCSVModal = <T,>({
  open,
  onOpenChange,
  onSuccess,
  title,
  resourceName,
  importFn,
  displayColumns,
}: ImportCSVModalProps<T>) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const {defaultSelected} =useCompanyStore()

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid CSV file (.csv)");
      return;
    }

    setFile(selectedFile);
    parseCSVPreview(selectedFile);
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text?.trim()) {
        toast.error("CSV file is empty");
        reset();
        return;
      }

      const rows = text
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      if (rows.length < 2) {
        toast.error("CSV has no data rows (only header)");
        reset();
        return;
      }

      const headers = rows[0]
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, ""));

      const dataRows = rows.slice(1, 21).map((row, idx) => {
        const values = row
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj: any = { __rowNumber: idx + 2 };
        headers.forEach((header, i) => {
          obj[header] = values[i] ?? "";
        });
        return obj;
      });

      setPreviewData(dataRows);
      toast.success(`${rows.length - 1} ${resourceName}s found • Showing first 20`);
    };

    reader.onerror = () => {
      toast.error("Failed to read the file");
      reset();
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId",defaultSelected?._id)

      const result = await importFn(formData);

      setImportResults({
        total: result.total,
        success: result.inserted,
        failed: result.failed,
        errors: result.errors || [],
      });

      toast.success(`Successfully imported ${result.inserted} ${resourceName}(s)`);

      if (result.failed > 0) {
        toast.warning(`${result.failed} row(s) failed to import`);
      }

      onSuccess?.();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Import failed. Please check the file and try again.";
      toast.error(message);
    } finally {
      setIsUploading(false);
      closeModal()
    }
  };

  const reset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    reset();
    onOpenChange(false);
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Determine which columns to display in preview
  const getDisplayKeys = (row: any) => {
    if (!displayColumns) {
      return Object.keys(row).filter((k) => k !== "__rowNumber");
    }
    return displayColumns.filter((col) => col in row || col === "__rowNumber");
  };

  return (
    <Dialog open={open} onOpenChange={closeModal} >
      <DialogContent className={`max-w-4xl max-h-[85vh] ${file?"custom-dialog-container":""} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Upload className="w-6 h-6 text-teal-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* File Selection */}
        {!file ? (
          <div className="relative flex flex-col items-center justify-center py-16 border-4 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-teal-500 hover:bg-teal-50/30 transition-all">
            <div
              className="absolute inset-0"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && droppedFile.name.toLowerCase().endsWith(".csv")) {
                  setFile(droppedFile);
                  parseCSVPreview(droppedFile);
                } else {
                  toast.error("Please drop a valid CSV file");
                }
              }}
            />

            <div
              className="absolute inset-0 cursor-pointer"
              onClick={handleDropAreaClick}
            />

            <FileText className="w-20 h-20 text-gray-400 mb-6 z-10" />
            <p className="text-xl font-semibold text-gray-700 mb-2 z-10">
              Drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mb-8 z-10">or click to browse</p>

            <label
              htmlFor="generic-csv-upload"
              className="relative z-20 cursor-pointer inline-flex items-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <Upload className="w-5 h-5 mr-3" />
              Choose CSV File
            </label>

            <input
              ref={fileInputRef}
              id="generic-csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : !importResults ? (
          /* Preview */
          <div className="space-y-8">
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <div>
                <p className="font-semibold text-lg">Selected File:</p>
                <p className="text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <X className="w-4 h-4 mr-2" />
                Change File
              </Button>
            </div>

            {previewData.length > 0 && (
              <>
                <div>
                  <p className="font-semibold text-lg mb-4">
                    Preview (first 20 rows)
                  </p>
                  <div className="overflow-x-auto border rounded-lg shadow-sm">
                    <table className="w-full text-sm bg-white">
                      <thead className="bg-teal-600 text-white">
                        <tr>
                          {getDisplayKeys(previewData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left font-medium"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {previewData.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {getDisplayKeys(row).map((key) => (
                              <td
                                key={key}
                                className="px-4 py-3 text-gray-700 whitespace-nowrap"
                              >
                                {String(row[key]) || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button variant="outline" onClick={reset}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={isUploading}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import {resourceName}s
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Results */
          <div className="space-y-8 py-8 text-center">
            {importResults.failed === 0 ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            ) : (
              <AlertCircle className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            )}

            <h3 className="text-2xl font-bold mb-4">Import Complete</h3>
            <div className="space-y-3 text-lg">
              <p>
                <span className="text-green-600 font-bold text-2xl">
                  {importResults.success}
                </span>{" "}
                {resourceName}(s) imported successfully
              </p>
              {importResults.failed > 0 && (
                <p>
                  <span className="text-red-600 font-bold text-2xl">
                    {importResults.failed}
                  </span>{" "}
                  failed
                </p>
              )}
              <p className="text-gray-600">
                Total rows processed: {importResults.total}
              </p>
            </div>

            {importResults.errors.length > 0 && (
              <div className="mt-8 text-left max-w-2xl mx-auto">
                <p className="font-semibold text-lg mb-3">Error Details:</p>
                <div className="max-h-64 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                  {importResults.errors.map((err, i) => (
                    <p key={i} className="text-red-700 mb-1">• {err}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-6">
              <Button size="lg" onClick={closeModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};