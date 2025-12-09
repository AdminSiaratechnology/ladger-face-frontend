import React from "react";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Building2,
  Tag
} from "lucide-react";

export default function StatCardBox({
  title,
  value,
  color,
  onClick
}: {
  title: string;
  value: string | number;
  color: string;
  onClick?: () => void;
}) {
  const getIcon = () => {
    const t = title.toLowerCase();

    if (t.includes("total")) return <ShoppingCart size={28} />;
    if (t.includes("active")) return <CheckCircle size={28} />;
    if (t.includes("expired")) return <XCircle size={28} />;
    if (t.includes("company")) return <Building2 size={28} />;

    return <Tag size={28} />;
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer"
    >
      <div
        className={`rounded-xl h-23 flex flex-col justify-between p-4 bg-gradient-to-br ${color} text-white shadow-md`}
      >
        {/* Title */}
        <div className="text-sm font-medium">{title}</div>

        {/* Bottom Row: Value + Icon */}
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold">{value}</div>

          {/* ICON RIGHT SIDE WITH PADDING */}
          <div className=" text-4xl pr-1 opacity-90">
            {getIcon()}
          </div>
        </div>
      </div>
    </div>
  );
}
