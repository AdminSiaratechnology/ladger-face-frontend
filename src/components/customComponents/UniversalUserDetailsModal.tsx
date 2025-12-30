import React, { memo, useState, useMemo } from "react";
import RightSideOverlay from "../../components/customComponents/RightSideOverlay";
import { useCompanyStore } from "../../../store/companyStore";

/* ================= PROPS ================= */
interface UniversalUserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

/* ================= INFO ROW ================= */
const InfoRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === "") return null;

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
const UniversalUserDetailsModal: React.FC<
  UniversalUserDetailsModalProps
> = ({ isOpen, onClose, data }) => {

  /* ✅ HOOKS ALWAYS RUN */
  const [activeTab, setActiveTab] = useState<
    "basic" | "association" | "access"
  >("basic");

  const { defaultSelected } = useCompanyStore();

  const companyName = defaultSelected?.namePrint || "—";
  const companyCode = defaultSelected?.code || "—";
  const logo = defaultSelected?.logo;

  /* 🔟 LAST 10 LOGIN HISTORY */
  const lastTenLogins = useMemo(() => {
    if (!data?.loginHistory?.length) return [];
    return [...data.loginHistory].reverse().slice(0, 10);
  }, [data?.loginHistory]);

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
      {/* ================= BODY WRAPPER ================= */}
      {!data ? (
        <div className="p-6 text-gray-500">
          No user data available
        </div>
      ) : (
        <>
          {/* ================= TABS ================= */}
          <div className="border-b px-6">
            <div className="flex gap-8 text-base overflow-x-auto no-scrollbar">
              {[
                { key: "basic", label: "Basic" },
                { key: "association", label: "Association" },
                { key: "access", label: "Access" },
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

          {/* ================= CONTENT ================= */}
          <div className="px-5 py-4 bg-white space-y-8">

            {/* ========== BASIC TAB ========== */}
            {activeTab === "basic" && (
              <section>
                <SectionHeader title="Basic Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="User Code" value={data.code} />
                  <InfoRow label="Name" value={data.name} />
                  <InfoRow label="Email" value={data.email} />
                  <InfoRow label="Phone" value={data.phone} />
                  <InfoRow label="Role" value={data.role} />
                  <InfoRow label="Status" value={data.status} />
                  {/* <InfoRow label="Is Demo User" value={data.isDemo ? "Yes" : "No"} /> */}
                </div>
              </section>
            )}

            {/* ========== ASSOCIATION TAB ========== */}
            {activeTab === "association" && (
              <section>
                <SectionHeader title="Association Details" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
                  <InfoRow label="Parent User ID" value={data.parent} />
                  <InfoRow label="Client ID" value={data.clientID} />
                  <InfoRow label="Created By" value={data.createdBy} />
                  <InfoRow label="Current Device ID" value={data.currentDeviceId} />
                </div>

                <hr className="border-gray-300 my-6" />

                <SectionHeader title="Login Activity (Last 10)" />
                <InfoRow
                  label="Last Login"
                  value={
                    data.lastLogin
                      ? new Date(data.lastLogin).toLocaleString()
                      : "—"
                  }
                />

                {lastTenLogins.length ? (
                  <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-700">
                    {lastTenLogins.map((entry: string, i: number) => (
                      <li key={i}>
                        {new Date(entry).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mt-2">
                    No login history available
                  </p>
                )}
              </section>
            )}

            {/* ========== ACCESS TAB ========== */}
            {activeTab === "access" && (
              <section>
                <SectionHeader title="Access Permissions" />

             

                {data.access?.length ? (
                  <div className="space-y-6 mt-4">
                    {data.access.map((acc: any, idx: number) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <p className="text-base font-semibold text-gray-800 mb-3">
                          {acc.company?.namePrint || "Unnamed Company"}
                        </p>

                        {acc.modules && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(acc.modules).map(
                              ([moduleName, moduleData]: [string, any], i) => (
                                <div
                                  key={i}
                                  className="border p-3 rounded-lg bg-white"
                                >
                                  <p className="font-semibold text-sm mb-2 text-gray-700">
                                    {moduleName}
                                  </p>

                                  {Object.entries(moduleData).map(
                                    ([subModule, perms]: [string, any], j) => (
                                      <div
                                        key={j}
                                        className="text-sm border-t pt-2 text-gray-700"
                                      >
                                        <p className="font-medium">
                                          {subModule}
                                        </p>
                                        <p className="text-gray-600">
                                          {[
                                            perms.create && "Create",
                                            perms.read && "Read",
                                            perms.update && "Update",
                                            perms.delete && "Delete",
                                          ]
                                            .filter(Boolean)
                                            .join(", ") || "No Access"}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">
                    No company access defined
                  </p>
                )}
              </section>
            )}

            {/* ========== META ========== */}
            <hr className="border-gray-200" />
            <div className="text-sm text-gray-500">
              <p>
                Created At:{" "}
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleString()
                  : "—"}
              </p>
           
            </div>
          </div>
        </>
      )}
    </RightSideOverlay>
  );
};

export default memo(UniversalUserDetailsModal);
