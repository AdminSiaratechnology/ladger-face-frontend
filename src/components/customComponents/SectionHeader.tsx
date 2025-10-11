import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  gradientFrom = "from-teal-400",
  gradientTo = "to-teal-500",
  className = "",
  iconClassName = "",
  titleClassName = ""
}) => {
  return (
    <div className={`flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 ${className}`}>
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center shadow ${iconClassName}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold text-gray-800 ${titleClassName}`}>
        {title}
      </h3>
    </div>
  );
};

export default SectionHeader;