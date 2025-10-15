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
  showCompany = true
}) => {
  const { defaultSelected, companies } = useCompanyStore();
  const company = companies.filter(
    (company) => company._id === defaultSelected
  );
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
          <div className="hidden sm:flex items-center gap-2 cursor-pointer bg-gradient-to-br from-teal-50 to-emerald-50 px-2 py-1.5 rounded-md transition-all duration-200 group">
            <div className="flex flex-col min-w-0 ">
              <span className="font-semibold text-sm text-teal-800 truncate max-w-[250px] group-hover:text-teal-900 transition-colors">
                {company[0]?.namePrint || "No Company"}
              </span>
              <span
                className="text-[10px] text-teal-600 font-mono hover:text-teal-700 transition-colors cursor-copy"
                onClick={(e) => {
                  e.stopPropagation();
                  if (company[0]?.code) {
                    navigator.clipboard
                      .writeText(company[0].code)
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
                {company[0]?.code ? `ID: ${company[0].code}` : "No ID"}
              </span>
            </div>
          </div>
          </div>
        )}
      </div>
    </DialogHeader>
  );
};

export default CustomFormDialogHeader;
