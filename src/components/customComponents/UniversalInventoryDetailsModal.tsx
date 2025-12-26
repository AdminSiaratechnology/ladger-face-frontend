import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { X } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

interface UniversalInventoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: "godown" | "stockGroup" | "stockCategory" | "unit";
}

/* ================= INFO ROW ================= */
const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">
        {String(value)}
      </p>
    </div>
  );
};

/* ================= SECTION TITLE ================= */
const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center mb-3">
    <div className="w-1 h-4 bg-blue-500 rounded mr-2" />
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
  </div>
);

/* ================= MAIN MODAL ================= */
const UniversalInventoryDetailsModal: React.FC<
  UniversalInventoryDetailsModalProps
> = ({ isOpen, onClose, data, type }) => {
  if (!data) return null;

  /* 🔹 COMPANY FROM STORE (DEFAULT SELECTED) */
  const { defaultSelected } = useCompanyStore();
console.log(defaultSelected)
  const companyName =
    defaultSelected?.namePrint || "—";

  const companyId =
    defaultSelected?.code || "—";

  const typeLabelMap: Record<string, string> = {
    godown: "Godown",
    stockGroup: "Stock Group",
    stockCategory: "Stock Category",
    unit: "Unit",
  };

  /* 🔹 BASIC FIELDS */
  const nameField =
    data.name ||
    data.unitName ||
    data.categoryName ||
    "—";

  const codeField =
    data.code ||
    data.stockGroupId ||
    data.unitId ||
    data._id ||
    "—";

  /* ================= SECTIONS ================= */
  const sections = [
    {
      title: "Basic Details",
      fields: [
        ["Code / ID", codeField],
        ["Name", nameField],
      ],
    },

    type === "godown" && {
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
    },

    type === "stockGroup" && {
      title: "Stock Group Details",
      fields: [
        ["Description", data.description],
        ["Parent Group", data.parent?.name],
        ["Stock Group ID", data.stockGroupId],
      ],
    },

    type === "stockCategory" && {
      title: "Stock Category Details",
      fields: [
        ["Description", data.description],
        ["Parent Category", data.parent?.name],
      ],
    },

    type === "unit" && {
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
    },
  ].filter(Boolean) as {
    title: string;
    fields: [string, any][];
  }[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 custom-dialog-container overflow-hidden">

        {/* ================= HEADER (COUPON STYLE) ================= */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          {/* LEFT */}
          <div>
            <p className="text-white text-lg font-semibold">
              View {typeLabelMap[type]}
            </p>
            <p className="text-xs text-blue-100">
              {nameField}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-tight">
                {companyName}
              </p>
              <p className="text-xs text-blue-100">
                ID: {companyId}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
            >
           
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {sections.map(
            (section, idx) =>
              section.fields.some(([, value]) => value) && (
                <Card key={idx} className="border shadow-sm">
                  <CardContent className="p-4">
                    <SectionTitle title={section.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                      {section.fields.map(
                        ([label, value], i) =>
                          value && (
                            <InfoRow
                              key={i}
                              label={label}
                              value={value}
                            />
                          )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
          )}

          {/* ================= META ================= */}
          {data.createdAt && (
            <div className="text-xs text-gray-400 pt-2">
              Created:{" "}
              {new Date(data.createdAt).toLocaleString()}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default UniversalInventoryDetailsModal;
