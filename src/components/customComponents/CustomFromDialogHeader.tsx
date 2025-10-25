import React, { useState } from "react";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Users } from "lucide-react";
import { useCompanyStore } from "../../../store/companyStore";
import { toast } from "sonner";

interface CustomFormDialogHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  gradientFrom?: string;
  gradientTo?: string;
  showCompany?: boolean;
}

const CustomFormDialogHeader: React.FC<CustomFormDialogHeaderProps> = ({
  icon = <Users className="w-4 h-4" />,
  title,
  subtitle,
  gradientFrom = "from-cyan-500",
  gradientTo = "to-blue-500",
  showCompany = true,
}) => {
  const { defaultSelected } = useCompanyStore();
  return (
    <DialogHeader
      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-3 py-2 -mx-6 -mt-6 rounded-t-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="w-full">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <span className="break-words">{title}</span>
          </DialogTitle>
          <p className="text-cyan-50 text-xs ml-8 leading-relaxed">
            {subtitle}
          </p>
        </div>
        {defaultSelected && showCompany && (
          <div className="pr-6">
            <div className="hidden sm:flex items-center gap-2 from-teal-50 to-emerald-50 px-3 py-2  group shadow-sm transition-all duration-200">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-sm text-white truncate">
                  {defaultSelected.namePrint || "No Company"}
                </span>
                <div
                  className="flex items-center gap-1 text-xs text-white font-mono hover:text-gray-200 transition-colors cursor-copy whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (defaultSelected?.code) {
                      navigator.clipboard
                        .writeText(defaultSelected.code)
                        .then(() => {
                          toast.success("Company ID copied to clipboard");
                        })
                        .catch(() => {
                          toast.error("Failed to copy Company ID");
                        });
                    }
                  }}
                  title="Click to copy Company ID"
                >
                  <span>ID: {defaultSelected?.code || "No ID"}</span>
                  <svg
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

export default CustomFormDialogHeader;
