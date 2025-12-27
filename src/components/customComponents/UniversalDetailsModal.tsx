import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { X } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

interface UniversalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: "customer" | "vendor" | "agent" | "ledger";
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
    <h3 className="text-sm font-semibold text-gray-800">
      {title}
    </h3>
  </div>
);

const UniversalDetailsModal: React.FC<UniversalDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  if (!isOpen || !data) return null;

  /* 🔹 COMPANY FROM STORE */
  const { defaultSelected } = useCompanyStore();

  const companyName =
    defaultSelected?.namePrint || "—";

  const companyId =
    defaultSelected?.code || "—";

  const {
    logo,
    code,
    shortName,
    contactPerson,
    emailAddress,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    zipCode,
    createdAt,
    banks = [],
    registrationDocs = [],
  } = data;

  const nameField =
    data.customerName ||
    data.vendorName ||
    data.agentName ||
    data.ledgerName ||
    "—";

  const typeLabelMap: Record<string, string> = {
    customer: "Customer",
    vendor: "Vendor",
    agent: "Agent",
    ledger: "Ledger",
  };

  /* ================= SECTIONS ================= */
  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["Contact Person", contactPerson],
        ["Email", emailAddress],
        ["Phone", phoneNumber],
        ["Address Line 1", addressLine1],
        ["Address Line 2", addressLine2],
        ["City", city],
        ["State", state],
        ["Country", country],
        ["ZIP Code", zipCode],
      ],
    },
    {
      title: "Business Details",
      fields: [
        [
          "Type",
          data.customerType ||
            data.vendorType ||
            data.agentType ||
            data.ledgerType,
        ],
        ["Industry Type", data.industryType],
        ["Group", data.customerGroup || data.vendorGroup || data.ledgerGroup],
        ["Company Size", data.companySize],
        [
          "Priority",
          data.customerPriority ||
            data.vendorPriority ||
            data.agentPriority,
        ],
        ["Territory", data.territory],
        ["Lead Source", data.leadSource],
        [
          "Sales / Procurement Person",
          data.salesPerson || data.procurementPerson,
        ],
        ["Agent", data.agent?.agentName],
      ],
    },
    {
      title: "Tax Information",
      fields: [
        ["GST Number", data.gstNumber],
        ["PAN Number", data.panNumber],
        ["TAN Number", data.tanNumber],
        ["VAT Number", data.vatNumber],
        ["MSME Registration", data.msmeRegistration],
      ],
    },
    {
      title: "Account Settings",
      fields: [
        ["Allow Back Orders", data.allowBackOrders ? "Yes" : "No"],
        ["Allow Partial Shipments", data.allowPartialShipments ? "Yes" : "No"],
        ["Allow Zero Valuation", data.allowZeroValuation ? "Yes" : "No"],
        ["Frozen Account", data.isFrozenAccount ? "Yes" : "No"],
        ["Tax Exempt", data.isTaxExempt ? "Yes" : "No"],
        ["Auto Invoice", data.autoInvoice ? "Yes" : "No"],
        ["Disabled", data.disabled ? "Yes" : "No"],
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 custom-dialog-container overflow-hidden">

        {/* ================= HEADER (COUPON STYLE) ================= */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 rounded-lg border object-cover"
              />
            )}
            <div>
              <p className="text-white text-lg font-semibold">
                View {typeLabelMap[type]}
              </p>
              <p className="text-xs text-blue-100">
                {nameField}
                {shortName && ` • ${shortName}`}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {companyName}
              </p>
              <p className="text-xs text-blue-100">
                ID: {code}
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

          {/* ================= BANK DETAILS ================= */}
          {banks.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <SectionTitle title="Bank Details" />
                {banks.map((bank: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border rounded-lg mb-3 bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                      <InfoRow label="Bank Name" value={bank.bankName} />
                      <InfoRow label="Branch" value={bank.branch} />
                      <InfoRow label="Account Holder" value={bank.accountHolderName} />
                      <InfoRow label="Account Number" value={bank.accountNumber} />
                      <InfoRow label="IFSC Code" value={bank.ifscCode} />
                      <InfoRow label="SWIFT Code" value={bank.swiftCode} />
                      <InfoRow label="MICR Number" value={bank.micrNumber} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ================= DOCUMENTS ================= */}
          {registrationDocs.length > 0 && (
            <Card className="border shadow-sm">
              <CardContent className="p-4">
                <SectionTitle title="Documents" />
                <div className="space-y-2">
                  {registrationDocs.map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                    >
                      <span className="text-sm">{doc.type}</span>
                      <span className="text-sm text-blue-600">View</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ================= META ================= */}
          {createdAt && (
            <div className="text-xs text-gray-400 pt-2">
              Created: {new Date(createdAt).toLocaleString()}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default UniversalDetailsModal;
