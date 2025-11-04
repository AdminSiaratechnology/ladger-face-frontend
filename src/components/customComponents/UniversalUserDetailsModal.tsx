import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface UniversalUserDetailsModalProps {
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

const UniversalUserDetailsModal: React.FC<UniversalUserDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  const status = data.status || "—";

  const sections = [
    {
      title: "Basic Information",
      fields: [
        ["User ID", data._id],
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Role", data.role],
        // ["Sub Roles", data.subRole?.length ? data.subRole.join(", ") : "—"],
        ["Status", status],
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
          data.lastLogin ? new Date(data.lastLogin).toLocaleString() : "—",
        ],
      ],
      customContent:
        data.loginHistory?.length > 0 ? (
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">Login History:</p>
            <ul className="list-disc ml-5 space-y-1">
              {data.loginHistory.map((entry: string, i: number) => (
                <li key={i}>{new Date(entry).toLocaleString()}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No login history available</p>
        ),
    },
    {
      title: "Access Permissions",
      fields: [],
      customContent:
        data.access?.length > 0 ? (
          <div className="space-y-4">
            {data.access.map((acc: any, idx: number) => (
              <Card
                key={idx}
                className="border border-gray-200 shadow-sm bg-gray-50"
              >
                <CardContent className="pt-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {acc.company?.namePrint || "Unnamed Company"}
                  </p>
                  {acc.modules && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(acc.modules).map(
                        (
                          [moduleName, moduleData]: [string, any],
                          i: number
                        ) => (
                          <div
                            key={i}
                            className="border p-2 rounded-lg bg-white"
                          >
                            <p className="font-semibold text-sm mb-1 text-gray-700">
                              {moduleName}
                            </p>
                            <div className="space-y-1">
                              {Object.entries(moduleData).map(
                                (
                                  [subModule, perms]: [string, any],
                                  j: number
                                ) => (
                                  <div
                                    key={j}
                                    className="text-xs border-t pt-1 text-gray-700"
                                  >
                                    <p className="font-medium">{subModule}</p>
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
          <p className="text-sm text-gray-500">No company access defined</p>
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
      <DialogContent className="custom-dialog-container p-0">
        <DialogHeader className="bg-gradient-to-r from-blue-200 to-blue-500 border-b border-gray-200 rounded-t-xl shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {data.name}
              </DialogTitle>
              <p className="text-sm text-gray-600">User Details</p>
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

          <div className="text-xs text-gray-500 border-t pt-3">
            {data.createdAt && (
              <div>Created: {new Date(data.createdAt).toLocaleString()}</div>
            )}
            {data.updatedAt && (
              <div>Updated: {new Date(data.updatedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalUserDetailsModal;
