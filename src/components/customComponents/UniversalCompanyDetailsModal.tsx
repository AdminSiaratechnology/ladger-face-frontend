import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface UniversalCompanyDetailsModalProps {
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

const UniversalCompanyDetailsModal: React.FC<
  UniversalCompanyDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  if (!data) return null;

  const status = data.status || "—";

  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["Company Code", data.code],
        ["Company Name", data.namePrint],
        ["Street Name", data.nameStreet],
        ["Status", status],
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
      fields: [],
      customContent:
        data.banks?.length > 0 ? (
          <div className="space-y-4">
            {data.banks.map((bank: any, index: number) => (
              <Card key={index} className="border border-gray-200 shadow-sm">
                <CardContent className="pt-3">
                  <p className="font-medium mb-2 text-sm text-gray-700">
                    {bank.bankName || `Bank ${index + 1}`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                    <InfoRow
                      label="Account Holder"
                      value={bank.accountHolderName}
                    />
                    <InfoRow
                      label="Account Number"
                      value={bank.accountNumber}
                    />
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
      fields: [],
      customContent:
        data.registrationDocs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.registrationDocs.map((doc: any, idx: number) => (
              <div
                key={idx}
                className="border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-1"
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
      <DialogContent className="custom-dialog-container p-0 ">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {data.namePrint}
              </DialogTitle>
              <p className="text-sm text-gray-600">Company Details</p>
            </div>
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
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto space-y-5">
          {sections.map((section, idx) => (
            <Card key={idx} className="border-0 shadow-md">
              <CardContent>
                <SectionTitle title={section.title} />
                {section.fields?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                    {section.fields.map(
                      ([label, value], i) =>
                        value && <InfoRow key={i} label={label} value={value} />
                    )}
                  </div>
                )}
                {section.customContent && (
                  <div className="mt-3">{section.customContent}</div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="text-xs text-gray-500 pt-3">
            {data.createdAt && (
              <div className="p-2">Created: {new Date(data.createdAt).toLocaleString()}</div>
            )}
            {/* {data.updatedAt && (
              <div>Updated: {new Date(data.updatedAt).toLocaleString()}</div>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalCompanyDetailsModal;
