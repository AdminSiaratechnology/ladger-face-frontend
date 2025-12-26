import React from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { X } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";

interface UniversalUserDetailsModalProps {
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
const UniversalUserDetailsModal: React.FC<
  UniversalUserDetailsModalProps
> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  /* 🔹 COMPANY FROM STORE */
  const { defaultSelected } = useCompanyStore();

  const companyName =
    defaultSelected?.name || "—";

  const companyId =
    defaultSelected?._id || "—";

  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["User ID", data._id],
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Role", data.role],
        ["Status", data.status],
      ],
    },
    {
      title: "Association Details",
      fields: [
        ["Parent User", data.parent],
        ["Client ID", data.clientID],
        ["Company ID", data.company],
        ["Created By", data.createdBy],
      ],
    },
    {
      title: "Login Activity",
      fields: [
        [
          "Last Login",
          data.lastLogin
            ? new Date(data.lastLogin).toLocaleString()
            : "—",
        ],
      ],
      customContent:
        data.loginHistory?.length > 0 ? (
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">Login History:</p>
            <ul className="list-disc ml-5 space-y-1">
              {data.loginHistory.map((entry: string, i: number) => (
                <li key={i}>
                  {new Date(entry).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No login history available
          </p>
        ),
    },
    {
      title: "Access Permissions",
      customContent:
        data.access?.length > 0 ? (
          <div className="space-y-4">
            {data.access.map((acc: any, idx: number) => (
              <Card
                key={idx}
                className="border shadow-sm bg-gray-50"
              >
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {acc.company?.namePrint || "Unnamed Company"}
                  </p>

                  {acc.modules && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(acc.modules).map(
                        ([moduleName, moduleData]: [string, any], i) => (
                          <div
                            key={i}
                            className="border p-2 rounded-lg bg-white"
                          >
                            <p className="font-semibold text-sm mb-1 text-gray-700">
                              {moduleName}
                            </p>

                            <div className="space-y-1">
                              {Object.entries(moduleData).map(
                                ([subModule, perms]: [string, any], j) => (
                                  <div
                                    key={j}
                                    className="text-xs border-t pt-1 text-gray-700"
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
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No company access defined
          </p>
        ),
    },
    {
      title: "Flags & Settings",
      fields: [
        ["All Permissions", data.allPermissions ? "Yes" : "No"],
        ["Area", data.area],
        ["Pincode", data.pincode],
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 custom-dialog-container overflow-hidden">

        {/* ================= HEADER (COUPON STYLE) ================= */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-semibold">
              View User
            </p>
            <p className="text-xs text-blue-100">
              {data.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
          

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full "
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

export default UniversalUserDetailsModal;
