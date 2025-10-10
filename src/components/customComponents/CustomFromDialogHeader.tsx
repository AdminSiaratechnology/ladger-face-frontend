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
  icon = <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
  title,
  subtitle,
  gradientFrom = "from-cyan-500",
  gradientTo = "to-blue-500",
}) => {
  return (
    <DialogHeader
      className={`pb-3 sm:pb-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl`}
    >
      <div className="flex items-center justify-between">
        <div className="w-full">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <span className="break-words">{title}</span>
          </DialogTitle>
          <p className="text-cyan-50 text-xs sm:text-sm mt-1 sm:mt-2 ml-0 sm:ml-10 md:ml-13 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </DialogHeader>
  );
};

export default CustomFormDialogHeader;