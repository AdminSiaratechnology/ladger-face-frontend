import React, { memo, useState } from "react";
import { Button } from "../ui/button";
import RightSideOverlay from "../../components/customComponents/RightSideOverlay";

/* ================= PROPS ================= */
interface UniversalCompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

/* ================= INFO ROW ================= */
const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (!value) return null;

  return (
    <div className="py-2">
      <p className="text-base font-semibold text-gray-700">
        {label}
      </p>
      <p className="text-base text-gray-600 break-words">
        {String(value)}
      </p>
    </div>
  );
};

/* ================= SECTION HEADER ================= */
const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-xl font-semibold text-teal-700 mb-4">
    {title}
  </h3>
);

/* ================= MAIN COMPONENT ================= */
const UniversalCompanyDetailsModal: React.FC<
  UniversalCompanyDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "bankReg" | "settings"
  >("basic");

  if (!data) return null;

  return (
    <RightSideOverlay
      open={isOpen}
      onClose={onClose}
      width="60vw"
      title={
      <div className="flex gap-2  ">
          <img src={data.logo} className="rounded-full w-10 h-10 " alt="" />
           <div className="flex flex-col">

           

          <span className="text-white font-semibold text-base">
            {data.namePrint || "Company Details"}
          </span>
          <span className="text-teal-100 text-sm">
            Code: {data.code}
          </span>
        </div>
        </div>
      }
    >
      {/* ================= TABS ================= */}
      <div className="border-b bg-red-500 px-6 w-full ">
        <div className="flex gap-8 text-base overflow-x-auto no-scrollbar fixed top-16  bg-white z-10 w-full left-0 right-0 pl-5    ">
          {[
            { key: "basic", label: "Basic" },
            { key: "bankReg", label: "Bank & Registration" },
            { key: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-2 relative font-semibold
                ${
                  activeTab === tab.key
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-teal-100"
                }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute left-0 right-0 -bottom-[1px]
                                 h-[3px] bg-teal-600 rounded" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-5 py-4 bg-white space-y-6 mt-10 ">

        {/* ========== BASIC TAB ========== */}
        {activeTab === "basic" && (
          <>
            <section>
              <SectionHeader className title="Basic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Company Code" value={data.code} />
                <InfoRow label="Company Name" value={data.namePrint} />
                <InfoRow label="Street Name" value={data.nameStreet} />
                <InfoRow label="Status" value={data.status} />
                <InfoRow label="Default Currency" value={data.defaultCurrency} />
              </div>
            </section>

            <hr className="border-gray-300 " />

            <section>
              <SectionHeader title="Address & Contact" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Address Line 1" value={data.address1} />
                <InfoRow label="Address Line 2" value={data.address2} />
                <InfoRow label="Address Line 3" value={data.address2} />
                <InfoRow label="City" value={data.city} />
                <InfoRow label="State" value={data.state} />
                <InfoRow label="Country" value={data.country} />
                <InfoRow label="Pincode" value={data.pincode} />
                <InfoRow label="Mobile" value={data.mobile} />
                <InfoRow label="Telephone" value={data.telephone} />
                 <InfoRow label="Fax Number" value={data.fax} />
                <InfoRow label="Email" value={data.email} />
                <InfoRow label="Website" value={data.website} />
              </div>
            </section>
          </>
        )}

        {/* ========== BANK & REGISTRATION TAB ========== */}
        {activeTab === "bankReg" && (
          <>
            <section>
              <SectionHeader title="Bank Details" />
              {data.banks?.length ? (
                data.banks.map((bank: any, idx: number) => (
                  <div key={idx} className="mb-6">
                    <p className="text-lg font-semibold text-gray-800 mb-3">
                      {bank.bankName || `Bank ${idx + 1}`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                      <InfoRow label="Account Holder" value={bank.accountHolderName} />
                      <InfoRow label="Account Number" value={bank.accountNumber} />
                      <InfoRow label="IFSC Code" value={bank.ifscCode} />
                       <InfoRow label="Swift Code" value={bank.swiftCode} />
                      <InfoRow label="Micr Number" value={bank.micrNumber} />
                       <InfoRow label="Branch Name" value={bank.branch} />
                       {/* <InfoRow label="Bank Name" value={bank.bankName} /> */}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-base text-gray-500">
                  No bank details available
                </p>
              )}
            </section>

            <hr className="border-gray-200 my-6" />

            <section>
              <SectionHeader title="Registration Details" />
              {data.registrationDocs?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.registrationDocs.map((doc: any, idx: number) => (
                    <div
                      key={idx}
                      className="border rounded-lg px-4 py-3"
                    >
                      <p className="text-base font-semibold text-gray-800">
                        {doc.type}
                      </p>
                      {doc.file && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-teal-600 text-base mt-1"
                          asChild
                        >
                          <a href={doc.file} target="_blank" rel="noreferrer">
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500">
                  No registration documents
                </p>
              )}
            </section>
          </>
        )}

        {/* ========== SETTINGS TAB ========== */}
        {activeTab === "settings" && (
          <section>
          
            <SectionHeader title="Settings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                 <InfoRow label="Company Status" value={data.status} />
                      <InfoRow
                label="Book Starting Date"
                 value={new Date(data.bookStartingDate).toISOString().split("T")[0]}
              />
                  <InfoRow
  label="Financial Date"
  value={new Date(data.financialDate).toISOString().split("T")[0]}
/>

                    <InfoRow
                label="Internal Notes"
                value={data.notes}
              />
              <InfoRow
                label="Maintain Godown"
                value={data.maintainGodown ? "Yes" : "No"}
              />
              <InfoRow
                label="Maintain Batch"
                value={data.maintainBatch ? "Yes" : "No"}
              />
              <InfoRow
                label="Allow Negative Order"
                value={data.negativeOrder ? "Yes" : "No"}
              />
              <InfoRow
                label="Close Quantity Order"
                value={data.closingQuantityOrder ? "Yes" : "No"}
              />
                 <InfoRow
                label="Auto Approve"
                value={data.autoApprove ? "Yes" : "No"}
              /> 
              <InfoRow
                label="Maintain Agent"
                value={data.maintainAgent ? "Yes" : "No"}
              />
            </div>
          </section>
        )}
      </div>
    </RightSideOverlay>
  );
};

export default memo(UniversalCompanyDetailsModal);
