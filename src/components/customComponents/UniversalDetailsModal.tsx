import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface UniversalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Customer, Vendor, Agent, Ledger
  type: "customer" | "vendor" | "agent" | "ledger";
}

const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
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

const UniversalDetailsModal: React.FC<UniversalDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  if (!data) return null;

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
    status,
    createdAt,
    updatedAt,
    banks = [],
    registrationDocs = [],
  } = data;

  const nameField =
    data.customerName || data.vendorName || data.agentName || data.ledgerName;

  const typeLabelMap: Record<string, string> = {
    customer: "Customer",
    vendor: "Vendor",
    agent: "Agent",
    ledger: "Ledger",
  };

  // 🔹 Grouped Sections by Field Category
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
          data.customerPriority || data.vendorPriority || data.agentPriority,
        ],
        ["Territory", data.territory],
        ["Lead Source", data.leadSource],
        [
          "Sales/Procurement Person",
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
      <DialogContent className="custom-dialog-container p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center gap-2">
            {logo && (
              <img
                src={logo}
                alt="Logo"
                className="w-12 h-12 rounded-lg border object-cover"
              />
            )}
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {nameField}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                {code} {shortName && `• ${shortName}`}
              </p>
              {/* <p className="text-xs text-gray-500 mt-1">{typeLabelMap[type]}</p> */}
            </div>
            {status && (
              <Badge
                className={
                  status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-2">
          {sections.map(
            (section, idx) =>
              section.fields.some(([, value]) => value) && (
                <Card key={idx} className="border-0 ">
                  <CardContent className="">
                    <SectionTitle title={section.title} />
                    <div className="grid grid-cols-1 md:grid-cols-2 shadow-md">
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

          {/* Bank Details */}
          {banks.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="">
                <SectionTitle title="Bank Details" />
                {banks.map((bank: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border border-gray-200 rounded-lg mb-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Bank Name" value={bank.bankName} />
                      <InfoRow label="Branch" value={bank.branch} />
                      <InfoRow
                        label="Account Holder"
                        value={bank.accountHolderName}
                      />
                      <InfoRow
                        label="Account Number"
                        value={bank.accountNumber}
                      />
                      <InfoRow label="IFSC Code" value={bank.ifscCode} />
                      <InfoRow label="SWIFT Code" value={bank.swiftCode} />
                      <InfoRow label="MICR Number" value={bank.micrNumber} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {registrationDocs.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardContent className="">
                <SectionTitle title="Documents" />
                <div className="grid grid-cols-1">
                  {registrationDocs.map((doc: any, idx: number) => (
                    <a
                      key={idx}
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-between items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <span className="text-sm">{doc.type}</span>
                      <span className="text-sm text-blue-600">View</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Info */}
          <div className="text-xs text-gray-500 pt-4">
            {createdAt && (
              <div className="p-2">Created: {new Date(createdAt).toLocaleString()}</div>
            )}
            {/* {updatedAt && (
              <div>Updated: {new Date(updatedAt).toLocaleString()}</div>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalDetailsModal;
