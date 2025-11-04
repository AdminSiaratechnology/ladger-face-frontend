import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface UniversalInventoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: "godown" | "stockGroup" | "stockCategory" | "unit";
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

const UniversalInventoryDetailsModal: React.FC<
  UniversalInventoryDetailsModalProps
> = ({ isOpen, onClose, data, type }) => {
  if (!data) return null;

  const typeLabelMap: Record<string, string> = {
    godown: "Godown",
    stockGroup: "Stock Group",
    stockCategory: "Stock Category",
    unit: "Unit",
  };

  const nameField = data.name || "—";
  const codeField = data.code || data.stockGroupId || data._id || "—";
  // const status = data.status || "—";

  // 🔹 Define type-based sections
  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["Code / ID", codeField],
        ["Name", nameField],
        // ["Status", status],
        // ["Created By", data.createdBy?.name || "—"],
      ],
    },

    type === "godown"
      ? {
          title: "Godown Details",
          fields: [
            ["Parent", data.parent],
            ["Manager", data.manager],
            ["Contact Number", data.contactNumber],
            ["Address", data.address],
            ["City", data.city],
            ["State", data.state],
            ["Country", data.country],
            ["Capacity", data.capacity],
            ["Is Primary", data.isPrimary ? "Yes" : "No"],
          ],
        }
      : null,

    type === "stockGroup"
      ? {
          title: "Stock Group Details",
          fields: [
            ["Description", data.description],
            ["Parent Group", data.parent?.name],
            ["Stock Group ID", data.stockGroupId],
          ],
        }
      : null,

    type === "stockCategory"
      ? {
          title: "Stock Category Details",
          fields: [
            ["Description", data.description],
            ["Parent Group", data.parent?.name],
            // ["Created By", data.createdBy?.name || "—"],
          ],
        }
      : null,

    type === "unit"
      ? {
          title: "Unit Details",
          fields: [
            ["Type", data.type],
            ["Symbol", data.symbol],
            ["UQC", data.UQC],
            ["Decimal Places", data.decimalPlaces],
            ["First Unit", data.firstUnit],
            ["Conversion", data.conversion],
            ["Second Unit", data.secondUnit],
          ],
        }
      : null,
  ].filter(Boolean) as { title: string; fields: [string, any][] }[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="custom-dialog-container p-0">
              <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {nameField}
              </DialogTitle>
              <p className="text-sm text-gray-600">{typeLabelMap[type]}</p>
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

        <div className="max-h-[70vh] overflow-y-auto ">
          {sections.map(
            (section, idx) =>
              section.fields.some(([, value]) => value) && (
                <Card key={idx} className="border-0 shadow-md">
                  <CardContent>
                    <SectionTitle title={section.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                      {section.fields.map(
                        ([label, value], i) =>
                          value && <InfoRow key={i} label={label} value={value} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
          )}

          {/* Metadata */}
          <div className="text-xs text-gray-500 border-t pt-3">
            {data.createdAt && (
              <div>Created: {new Date(data.createdAt).toLocaleString()}</div>
            )}
            {data.updatedAt && (
              <div>Updated: {new Date(data.updatedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalInventoryDetailsModal;
