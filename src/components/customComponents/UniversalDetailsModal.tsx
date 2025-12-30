import React, { memo, useState } from "react";
import RightSideOverlay from "../../components/customComponents/RightSideOverlay";
import { useCompanyStore } from "../../../store/companyStore";

/* ================= PROPS ================= */
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
    <div className="py-2">
      <p className="text-base font-semibold text-gray-700">{label}</p>
      <p className="text-base text-gray-600 break-words">{String(value)}</p>
    </div>
  );
};

/* ================= SECTION HEADER ================= */
const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-xl font-semibold text-teal-700 mb-4">{title}</h3>
);

/* ================= MAIN COMPONENT ================= */
const UniversalDetailsModal: React.FC<UniversalDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  /* ✅ HOOKS ALWAYS ON TOP */
  const [activeTab, setActiveTab] = useState<
    "basic" | "business" | "taxAccount" | "bank" | "documents"
  >("basic");

  const { defaultSelected } = useCompanyStore();

  if (!isOpen || !data) return null;

  const companyName = defaultSelected?.namePrint || "—";
  const companyCode = defaultSelected?.code || "—";
  const companyLogo = defaultSelected?.logo;

  const {
    logo,
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
    data.name ||
    "—";

  const showBusinessTab = type !== "ledger";

  return (
    <RightSideOverlay
      open={isOpen}
      onClose={onClose}
      width="60vw"
      title={
        <div className="flex gap-3 items-center">
    
            <img
              src={ companyLogo}
              className="w-10 h-10 rounded-lg object-cover"
              alt="logo"
            />
       
          <div className="flex flex-col">
            <span className="text-white font-semibold text-base">
              {companyName}
            </span>
            <span className="text-teal-100 text-sm">
              Code: {companyCode}
            </span>
          </div>
        </div>
      }
    >
      {/* ================= TABS ================= */}
      <div className="border-b px-6">
        <div className="flex gap-8 text-base overflow-x-auto no-scrollbar">
          {["basic", showBusinessTab && "business", "taxAccount", "bank", "documents"]
            .filter(Boolean)
            .map((tab) => (
              <button
                key={tab as string}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 relative font-semibold ${
                  activeTab === tab
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab === "basic"
                  ? "Basic"
                  : tab === "business"
                  ? "Business"
                  : tab === "taxAccount"
                  ? "Tax & Account"
                  : tab === "bank"
                  ? "Bank"
                  : "Documents"}
                {activeTab === tab && (
                  <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-teal-600" />
                )}
              </button>
            ))}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-5 py-4 bg-white space-y-8">

        {/* ================= BASIC ================= */}
        {activeTab === "basic" && (
          <>
            <section>
              <SectionHeader title="Basic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Name" value={nameField} />
                <InfoRow label="Short Name" value={shortName} />
                <InfoRow label="Contact Person" value={contactPerson} />
                <InfoRow label="Email" value={emailAddress} />
                <InfoRow label="Phone" value={phoneNumber || data.mobileNumber} />
                <InfoRow label="Status" value={data.status} />
                <InfoRow label="Currency" value={data.currency} />
                <InfoRow
                  label="Priority"
                  value={
                    data.customerPriority ||
                    data.vendorPriority ||
                    data.agentPriority ||
                    data.ledgerPriority
                  }
                />
              </div>
            </section>

            <hr className="border-gray-300" />

            <section>
              <SectionHeader title="Address" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Address Line 1" value={addressLine1} />
                <InfoRow label="Address Line 2" value={addressLine2} />
                <InfoRow label="City" value={city} />
                <InfoRow label="State" value={state} />
                <InfoRow label="Country" value={country} />
                <InfoRow label="ZIP Code" value={zipCode} />
                <InfoRow label="Website" value={data.website} />
                <InfoRow label="Fax Number" value={data.faxNumber} />
              </div>
            </section>
          </>
        )}

        {/* ================= BUSINESS ================= */}
        {showBusinessTab && activeTab === "business" && (
          <section>
            <SectionHeader title="Business Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">

              {/* COMMON */}
              <InfoRow label="Industry Type" value={data.industryType} />
              <InfoRow label="Group" value={data.group} />
              <InfoRow label="Company Size" value={data.companySize} />
              <InfoRow label="Territory" value={data.territory} />
              <InfoRow label="Lead Source" value={data.source || data.leadSource} />
              <InfoRow label="Designation" value={data.designation} />

              {/* AGENT ONLY */}
              {type === "agent" && (
                <>
                  <InfoRow label="Agent Priority" value={data.agentPriority} />
                  <InfoRow label="Commission Rate" value={data.commissionRate} />
                  <InfoRow
                    label="Commission Structure"
                    value={data.commissionStructure}
                  />
                  <InfoRow label="Experience Level" value={data.experienceLevel} />
                  <InfoRow
                    label="Performance Rating"
                    value={data.performanceRating}
                  />
                  <InfoRow
                    label="Active Contracts"
                    value={data.activeContracts}
                  />
                  <InfoRow label="Payment Terms" value={data.paymentTerms} />
                  <InfoRow label="Internal Notes" value={data.internalNotes} />
                </>
              )}
            </div>
          </section>
        )}

        {/* ================= TAX & ACCOUNT ================= */}
        {activeTab === "taxAccount" && (
          <>
            <section>
              <SectionHeader title="Tax Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="GST Number" value={data.gstNumber} />
                <InfoRow label="PAN Number" value={data.panNumber} />
                <InfoRow label="TAN Number" value={data.tanNumber} />
                <InfoRow label="Tax Category" value={data.taxCategory} />
                <InfoRow label="Tax ID" value={data.taxId} />
                <InfoRow label="MSME Registration" value={data.msmeRegistration} />
              </div>
            </section>

            <hr className="border-gray-300" />

            <section>
              <SectionHeader title="Account Settings" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow
                  label="Tax Exempt"
                  value={data.isTaxExempt ? "Yes" : "No"}
                />
                <InfoRow
                  label="Reverse Charge"
                  value={data.reverseCharge ? "Yes" : "No"}
                />
                <InfoRow
                  label="Frozen Account"
                  value={data.isFrozenAccount ? "Yes" : "No"}
                />
                <InfoRow label="Disabled" value={data.disabled ? "Yes" : "No"} />
              </div>
            </section>
          </>
        )}

        {/* ================= BANK ================= */}
        {activeTab === "bank" && (
          <section>
            <SectionHeader title="Bank Details" />
            {banks.length ? (
              banks.map((bank: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="Bank Name" value={bank.bankName} />
                  <InfoRow label="Branch" value={bank.branch} />
                  <InfoRow
                    label="Account Holder"
                    value={bank.accountHolderName}
                  />
                  <InfoRow label="Account Number" value={bank.accountNumber} />
                  <InfoRow label="IFSC Code" value={bank.ifscCode} />
                  <InfoRow label="SWIFT Code" value={bank.swiftCode} />
                  <InfoRow label="MICR Number" value={bank.micrNumber} />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No bank details available</p>
            )}
          </section>
        )}

        {/* ================= DOCUMENTS ================= */}
        {activeTab === "documents" && (
          <section>
            <SectionHeader title="Documents" />
            {registrationDocs.length ? (
              <div className="space-y-3">
                {registrationDocs.map((doc: any, idx: number) => (
                  <a
                    key={idx}
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center border rounded-lg px-4 py-2 hover:bg-gray-50"
                  >
                    <span>{doc.type}</span>
                    <span className="text-teal-600 font-medium">View</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No documents available</p>
            )}
          </section>
        )}

        {/* ================= META ================= */}
        {createdAt && (
          <>
            <hr className="border-gray-200" />
            <div className="text-sm text-gray-500">
              Created At: {new Date(createdAt).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </RightSideOverlay>
  );
};

export default memo(UniversalDetailsModal);
