import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface UniversalProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="py-1 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {String(value)}
      </p>
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center mb-2 bg-gradient-to-r from-blue-50 to-blue-100">
    <div className="w-1 h-4 bg-blue-500 rounded mr-3"></div>
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
  </div>
);

const UniversalProductDetailsModal: React.FC<
  UniversalProductDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const {
    name,
    code,
    partNo,
    status,
    productType,
    defaultSupplier,
    minimumRate,
    maximumRate,
    minimumQuantity,
    defaultGodown,
    stockGroup,
    stockCategory,
    unit,
    alternateUnit,
    taxConfiguration,
    createdAt,
    updatedAt,
  } = data;

  // 🔹 Sections grouped for clean display
  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["Product Name", name],
        ["Code", code],
        ["Part Number", partNo],
        ["Type", productType],
        ["Default Supplier", defaultSupplier],
      ],
    },
    {
      title: "Inventory Details",
      fields: [
        ["Default Godown", defaultGodown?.name || "—"],
        ["Stock Group", stockGroup?.name || "—"],
        ["Stock Category", stockCategory?.name || "—"],
        ["Unit", unit?.name || "—"],
        ["Alternate Unit", alternateUnit?.name || "—"],
      ],
    },
    {
      title: "Pricing & Quantity",
      fields: [
        ["Minimum Quantity", minimumQuantity],
        ["Minimum Rate", minimumRate],
        ["Maximum Rate", maximumRate],
      ],
    },
    taxConfiguration && {
      title: "Tax Configuration",
      fields: [
        ["Applicable", taxConfiguration.applicable ? "Yes" : "No"],
        ["HSN Code", taxConfiguration.hsnCode],
        ["Tax %", taxConfiguration.taxPercentage],
        ["CGST", taxConfiguration.cgst],
        ["SGST", taxConfiguration.sgst],
        ["Cess", taxConfiguration.cess],
        ["Additional Cess", taxConfiguration.additionalCess],
        [
          "Applicable Date",
          taxConfiguration.applicableDate
            ? new Date(taxConfiguration.applicableDate).toLocaleDateString()
            : "—",
        ],
      ],
    },
  ].filter(Boolean) as { title: string; fields: [string, any][] }[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="custom-dialog-container p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {name || "Unnamed Product"}
              </DialogTitle>
              <p className="text-sm text-gray-600">Product Details</p>
            </div>
            {status && (
              <Badge
                className={
                  status === "active"
                    ? "bg-green-100 text-green-800"
                    : status === "inactive"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {sections.map(
            (section, idx) =>
              section.fields.some(([, value]) => value) && (
                <Card key={idx} className="border-0 shadow-md mb-3">
                  <CardContent>
                    <SectionTitle title={section.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                      {section.fields.map(
                        ([label, value], i) =>
                          value && (
                            <InfoRow key={i} label={label} value={value} />
                          )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
          )}

          {/* Meta info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            {createdAt && (
              <div>Created: {new Date(createdAt).toLocaleString()}</div>
            )}
            {updatedAt && (
              <div>Updated: {new Date(updatedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalProductDetailsModal;
