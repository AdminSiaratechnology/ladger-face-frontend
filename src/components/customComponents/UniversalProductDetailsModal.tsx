import React, { memo, useState } from "react";
import RightSideOverlay from "../../components/customComponents/RightSideOverlay";
import { useCompanyStore } from "../../../store/companyStore";

/* ================= PROPS ================= */
interface UniversalProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
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
const UniversalProductDetailsModal: React.FC<
  UniversalProductDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "inventoryOpening" | "pricingTax" | "images"
  >("basic");

   const { defaultSelected } = useCompanyStore();
  if (!data) return null;

  console.log(data);
  /* 🔹 COMPANY */
 
  const companyName = defaultSelected?.namePrint || "—";
  const companyCode = defaultSelected?.code || "—";
  const logo = defaultSelected?.logo;

  return (
    <RightSideOverlay
      open={isOpen}
      onClose={onClose}
      width="65vw"
      title={
        <div className="flex gap-2">
          {logo && (
            <img
              src={logo}
              className="rounded-full w-10 h-10"
              alt="company-logo"
            />
          )}
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
          {[
            { key: "basic", label: "Basic" },
            { key: "inventoryOpening", label: "Inventory & Opening" },
            { key: "pricingTax", label: "Pricing & Tax" },
            { key: "images", label: "Images" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-2 relative font-semibold cursor-pointer ${
                activeTab === tab.key
                  ? "text-teal-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-teal-50"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-teal-600 rounded" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-5 py-4 bg-white space-y-8">

        {/* ================= BASIC ================= */}
        {activeTab === "basic" && (
          <section>
            <SectionHeader title="Basic Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
              <InfoRow label="Product Name" value={data.name} />
              <InfoRow label="Product Code" value={data.code} />
              <InfoRow label="Part Number" value={data.partNo} />
              <InfoRow label="Status" value={data.status} />
              <InfoRow label="Batch Managed" value={data.batch ? "Yes" : "No"} />
              <InfoRow
                label="Manufacturing Date"
                value={
                  data.mfgDate
                    ? new Date(data.mfgDate).toISOString().split("T")[0]
                    : "—"
                }
              />
              <InfoRow
                label="Expiry Date"
                value={
                  data.expiryDate
                    ? new Date(data.expiryDate).toISOString().split("T")[0]
                    : "—"
                }
              />
            </div>
          </section>
        )}

        {/* ========== INVENTORY + OPENING ========== */}
        {activeTab === "inventoryOpening" && (
          <>
            <section>
              <SectionHeader title="Inventory Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Stock Group" value={data.stockGroup?.name} />
                <InfoRow label="Stock Category" value={data.stockCategory?.name} />
                <InfoRow label="Unit" value={data.unit?.name} />
                <InfoRow label="Unit Symbol" value={data.unit?.symbol} />
                <InfoRow
                  label="Minimum Quantity"
                  value={data.minimumQuantity}
                />
              </div>
            </section>

            <hr className="border-gray-300" />

            <section>
              <SectionHeader title="Opening Stock" />
              {data.openingQuantities?.length ? (
                data.openingQuantities.map((oq: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-x-12"
                  >
                    <InfoRow label="Godown ID" value={oq.godown} />
                    <InfoRow label="Batch" value={oq.batch} />
                    <InfoRow label="Quantity" value={oq.quantity} />
                    <InfoRow label="Rate" value={oq.rate} />
                    <InfoRow label="Amount" value={oq.amount} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No opening stock available
                </p>
              )}
            </section>
          </>
        )}

        {/* ========== PRICING + TAX ========== */}
        {activeTab === "pricingTax" && (
          <>
            <section>
              <SectionHeader title="Pricing Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                <InfoRow label="Minimum Rate" value={data.minimumRate} />
                <InfoRow label="Maximum Rate" value={data.maximumRate} />
                <InfoRow
                  label="Price Includes Tax"
                  value={data.priceIncludesTax ? "Yes" : "No"}
                />
              </div>
            </section>

            <hr className="border-gray-300" />

            <section>
              <SectionHeader title="Tax Configuration" />
              {data.taxConfiguration ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow
                    label="Applicable"
                    value={data.taxConfiguration.applicable ? "Yes" : "No"}
                  />
                  <InfoRow
                    label="HSN Code"
                    value={data.taxConfiguration.hsnCode}
                  />
                  <InfoRow
                    label="Tax %"
                    value={data.taxConfiguration.taxPercentage}
                  />
                  <InfoRow label="CGST" value={data.taxConfiguration.cgst} />
                  <InfoRow label="SGST" value={data.taxConfiguration.sgst} />
                  <InfoRow label="Cess" value={data.taxConfiguration.cess} />
                  <InfoRow
                    label="Additional Cess"
                    value={data.taxConfiguration.additionalCess}
                  />
                  <InfoRow
                    label="Applicable Date"
                    value={
                      data.taxConfiguration.applicableDate
                        ? new Date(
                            data.taxConfiguration.applicableDate
                          ).toISOString().split("T")[0]
                        : "—"
                    }
                  />
                </div>
              ) : (
                <p className="text-gray-500">
                  No tax configuration available
                </p>
              )}
            </section>
          </>
        )}

        {/* ================= IMAGES ================= */}
        {activeTab === "images" && (
          <section>
            <SectionHeader title="Product Images" />
            {data.images?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.images.map((img: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {img.angle}
                    </p>
                    <img
                      src={img.previewUrl}
                      alt={img.angle}
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No images uploaded</p>
            )}
          </section>
        )}

        {/* ================= META ================= */}
        {data.createdAt && (
          <>
            <hr className="border-gray-200" />
            <div className="text-sm text-gray-500">
              Created At: {new Date(data.createdAt).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </RightSideOverlay>
  );
};

export default memo(UniversalProductDetailsModal);
