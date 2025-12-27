import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { X } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

/* =========================
   PROPS
========================= */
interface PriceListViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: "priceList";
}

/* =========================
   SMALL COMPONENTS
========================= */
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

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center mb-3">
    <div className="w-1 h-4 bg-blue-500 rounded mr-2" />
    <h3 className="text-sm font-semibold text-gray-800">
      {title}
    </h3>
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */
const PriceListViewModal: React.FC<PriceListViewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!isOpen || !data) return null;

  /* 🔹 COMPANY FROM STORE */
  const { defaultSelected } = useCompanyStore();

  const companyName =
    defaultSelected?.namePrint || "—";

  const companyId =
    defaultSelected?.code || "—";

  /* =========================
     BASIC SECTIONS
  ========================= */
  const sections = [
    {
      title: "Basic Details",
      fields: [
        ["Code ", data.code],
        ["Price Level", data.priceLevel || data.name],
        ["Stock Group", data.stockGroupName],
      ],
    },
    {
      title: "Price List Details",
      fields: [
        ["Applicable From", data.applicableFrom || data.validFrom],
        ["Page", data.page],
        ["Total Items", data.items?.length || data.itemCount || 0],
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 custom-dialog-container overflow-hidden">

        {/* ================= HEADER (COUPON STYLE) ================= */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          {/* LEFT */}
          <div>
            <p className="text-white text-lg font-semibold">
              View Price List
            </p>
            <p className="text-xs text-blue-100">
              {data.priceLevel || data.name}
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
              className="w-8 h-8 flex items-center justify-center rounded-full "
            >
        
            </button>
          </div>
        </div>

        {/* ================= BODY ================= */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 bg-gray-50">

          {/* BASIC + DETAILS */}
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

          {/* ================= ITEMS + SLABS ================= */}
          {Array.isArray(data.items) && data.items.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <SectionTitle title="Items & Slabs" />

                {data.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="mb-5 border rounded-lg p-3 bg-white"
                  >
                    {/* ITEM NAME */}
                    <p className="font-semibold text-sm mb-2">
                      {item.itemName}
                    </p>

                    {/* SLABS TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-2 py-1">From Qty</th>
                            <th className="border px-2 py-1">Less Than</th>
                            <th className="border px-2 py-1">Rate</th>
                            <th className="border px-2 py-1">Discount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.slabs?.map((s: any, si: number) => (
                            <tr key={si}>
                              <td className="border px-2 py-1 text-center">
                                {s.fromQty}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {s.lessThanQty ?? "∞"}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {s.rate}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {s.discount}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ================= METADATA ================= */}
          {data.createdAt && (
            <div className="text-xs text-gray-400 pt-2">
              Created: {new Date(data.createdAt).toLocaleString()}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default PriceListViewModal;
