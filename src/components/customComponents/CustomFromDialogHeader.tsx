import React from "react";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Users } from "lucide-react";

interface CustomFormDialogHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const CustomFormDialogHeader: React.FC<CustomFormDialogHeaderProps> = ({
  icon = <Users className="w-4 h-4" />,
  title,
  subtitle,
  gradientFrom = "from-cyan-500",
  gradientTo = "to-blue-500",
}) => {
  return (
    <DialogHeader
      className={`pb-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-4 py-3 -mx-4 -mt-4 rounded-t-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="w-full">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <span className="break-words">{title}</span>
          </DialogTitle>
          <p className="text-cyan-50 text-xs mt-1 ml-8 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </DialogHeader>
  );
};

export default CustomFormDialogHeader;