import React, { memo } from "react";
import RightSideOverlay from "../../components/customComponents/RightSideOverlay";
import { useCompanyStore } from "../../../store/companyStore";

/* ================= PROPS ================= */
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
    <div className="py-2">
      <p className="text-base font-semibold text-gray-700">{label}</p>
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
const UniversalInventoryDetailsModal: React.FC<
  UniversalInventoryDetailsModalProps
> = ({ isOpen, onClose, data, type }) => {

  /* ✅ HOOKS ALWAYS RUN */
  const { defaultSelected } = useCompanyStore();

  const companyName = defaultSelected?.namePrint || "—";
  const companyCode = defaultSelected?.code || "—";
  const logo = defaultSelected?.logo;

  /* 🔹 SAFE NAME & CODE */
  const nameField =
    data?.groupName ||
    data?.name ||
    data?.unitName ||
    data?.categoryName ||
    "—";

  const codeField =
    data?.groupCode ||
    data?.code ||
    data?.stockGroupId ||
    data?.unitId ||
    data?._id ||
    "—";

  return (
    <RightSideOverlay
      open={isOpen}
      onClose={onClose}
      width="60vw"
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
      {!data ? (
        <div className="p-6 text-gray-500">
          No inventory data available
        </div>
      ) : (
        <div className="px-5 py-4 bg-white space-y-6">

          {/* ========== BASIC DETAILS ========== */}
          <section>
            <SectionHeader title="Basic Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
              <InfoRow label="Company" value={companyName} />
              <InfoRow label="Code" value={codeField} />
              <InfoRow label="Name" value={nameField} />
              <InfoRow label="Status" value={data.status} />
            </div>
          </section>

          {/* ========== STOCK GROUP / LEDGER GROUP ========== */}
          {type === "stockGroup" && (
            <>
              <hr className="border-gray-300" />
              <section>
                <SectionHeader title="Stock Group Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow
                    label="Parent Group ID"
                    value={data.parentGroup}
                  />
                  <InfoRow
                    label="Deleted"
                    value={data.isDeleted ? "Yes" : "No"}
                  />
                </div>
              </section>
            </>
          )}

          {/* ========== GODOWN DETAILS ========== */}
          {type === "godown" && (
            <>
              <hr className="border-gray-300" />
              <section>
                <SectionHeader title="Godown Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="Parent" value={data.parent} />
                  <InfoRow label="Manager" value={data.manager} />
                  <InfoRow label="Contact Number" value={data.contactNumber} />
                  <InfoRow label="Capacity" value={data.capacity} />
                  <InfoRow label="Address" value={data.address} />
                  <InfoRow label="City" value={data.city} />
                  <InfoRow label="State" value={data.state} />
                  <InfoRow label="Country" value={data.country} />
                  <InfoRow
                    label="Is Primary"
                    value={data.isPrimary ? "Yes" : "No"}
                  />
                </div>
              </section>
            </>
          )}

          {/* ========== STOCK CATEGORY DETAILS ========== */}
          {type === "stockCategory" && (
            <>
              <hr className="border-gray-300" />
              <section>
                <SectionHeader title="Stock Category Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="Description" value={data.description} />
                  <InfoRow
                    label="Parent Category"
                    value={data.parentCategory || data.parent?.name}
                  />
                </div>
              </section>
            </>
          )}

          {/* ========== UNIT DETAILS ========== */}
          {type === "unit" && (
            <>
              <hr className="border-gray-300" />
              <section>
                <SectionHeader title="Unit Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="Type" value={data.type} />
                  <InfoRow label="Symbol" value={data.symbol} />
                  <InfoRow label="UQC" value={data.UQC} />
                  <InfoRow label="Decimal Places" value={data.decimalPlaces} />
                  <InfoRow label="First Unit" value={data.firstUnit} />
                  <InfoRow label="Conversion" value={data.conversion} />
                  <InfoRow label="Second Unit" value={data.secondUnit} />
                </div>
              </section>
            </>
          )}

          {/* ========== META INFO ========== */}
          {(data.createdAt || data.updatedAt) && (
            <>
              <hr className="border-gray-200" />
              <div className="text-sm text-gray-500 space-y-1">
                {data.createdAt && (
                  <div>
                    Created At:{" "}
                    {new Date(data.createdAt).toLocaleString()}
                  </div>
                )}
            
              </div>
            </>
          )}
        </div>
      )}
    </RightSideOverlay>
  );
};

export default memo(UniversalInventoryDetailsModal);
