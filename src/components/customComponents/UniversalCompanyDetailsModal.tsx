import React, { memo } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

interface UniversalCompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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

/* ================= MAIN COMPONENT ================= */
const UniversalCompanyDetailsModal: React.FC<
  UniversalCompanyDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  /* 🔹 COMPANY FROM STORE */
  const { defaultSelected } = useCompanyStore();

  const companyName =
    defaultSelected?.namePrint || "—";

  const companyId =
    defaultSelected?.code || "—";

  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["Company Code", data.code],
        ["Company Name", data.namePrint],
        ["Street Name", data.nameStreet],
        ["Status", data.status],
        ["Default Currency", data.defaultCurrency],
      ],
    },
    {
      title: "Address Details",
      fields: [
        ["Address Line 1", data.address1],
        ["Address Line 2", data.address2],
        ["Address Line 3", data.address3],
        ["City", data.city],
        ["State", data.state],
        ["Country", data.country],
        ["Pincode", data.pincode],
      ],
    },
    {
      title: "Contact Details",
      fields: [
        ["Telephone", data.telephone],
        ["Mobile", data.mobile],
        ["Fax", data.fax],
        ["Email", data.email],
        ["Website", data.website],
      ],
    },
    {
      title: "Tax Details",
      fields: [
        ["GST Number", data.gstNumber],
        ["PAN Number", data.panNumber],
        ["TAN Number", data.tanNumber],
        ["VAT Number", data.vatNumber],
        ["MSME Number", data.msmeNumber],
        ["UDYAM Number", data.udyamNumber],
      ],
    },
    {
      title: "Bank Details",
      customContent:
        data.banks?.length > 0 ? (
          <div className="space-y-4">
            {data.banks.map((bank: any, index: number) => (
              <Card key={index} className="border shadow-sm">
                <CardContent className="p-4">
                  <p className="font-medium mb-2 text-sm text-gray-700">
                    {bank.bankName || `Bank ${index + 1}`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <InfoRow label="Account Holder" value={bank.accountHolderName} />
                    <InfoRow label="Account Number" value={bank.accountNumber} />
                    <InfoRow label="IFSC Code" value={bank.ifscCode} />
                    <InfoRow label="Swift Code" value={bank.swiftCode} />
                    <InfoRow label="MICR Number" value={bank.micrNumber} />
                    <InfoRow label="Branch" value={bank.branch} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No bank details available</p>
        ),
    },
    {
      title: "Registration Documents",
      customContent:
        data.registrationDocs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.registrationDocs.map((doc: any, idx: number) => (
              <div
                key={idx}
                className="border p-3 rounded-lg shadow-sm flex flex-col gap-1"
              >
                <p className="text-sm font-semibold">{doc.type}</p>
                {doc.file && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 text-sm"
                    asChild
                  >
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.fileName || "View Document"}
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No registration documents found
          </p>
        ),
    },
    {
      title: "Settings",
      fields: [
        ["Maintain Godown", data.maintainGodown ? "Yes" : "No"],
        ["Maintain Batch", data.maintainBatch ? "Yes" : "No"],
        ["Allow Negative Order", data.negativeOrder ? "Yes" : "No"],
        ["Close Quantity Order", data.closingQuantityOrder ? "Yes" : "No"],
      ],
    },
    {
      title: "Important Dates",
      fields: [
        [
          "Book Starting Date",
          data.bookStartingDate
            ? new Date(data.bookStartingDate).toLocaleDateString()
            : "—",
        ],
        [
          "Financial Date",
          data.financialDate
            ? new Date(data.financialDate).toLocaleDateString()
            : "—",
        ],
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0  custom-dialog-container overflow-hidden">

        {/* ================= HEADER (COUPON STYLE) ================= */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-semibold">
              View Company
            </p>
            <p className="text-xs text-blue-100">
              {data.namePrint}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
             {data.namePrint}
              </p>
              <p className="text-xs text-blue-100">
                ID: {data.code}
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
          {sections.map((section, idx) => (
            <Card key={idx} className="border shadow-sm">
              <CardContent className="p-4">
                <SectionTitle title={section.title} />
                {section.fields && (
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
                )}
                {section.customContent && (
                  <div className="mt-3">
                    {section.customContent}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

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

export default memo(UniversalCompanyDetailsModal);
