import React from "react";
import { Calendar, AlertCircle } from "lucide-react";

// 1. The Same Dropdown Component (No changes needed inside here)
export const MonthYearPicker = ({ label, value, name, onChange, minDate, error }) => {
  const [year, month] = value ? value.split("-") : ["", ""];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  const months = [
    { val: "01", label: "January" }, { val: "02", label: "February" },
    { val: "03", label: "March" }, { val: "04", label: "April" },
    { val: "05", label: "May" }, { val: "06", label: "June" },
    { val: "07", label: "July" }, { val: "08", label: "August" },
    { val: "09", label: "September" }, { val: "10", label: "October" },
    { val: "11", label: "November" }, { val: "12", label: "December" },
  ];

  const handlePartChange = (type, partValue) => {
    let newYear = year || currentYear;
    let newMonth = month || "01";
    if (type === "month") newMonth = partValue;
    if (type === "year") newYear = partValue;

    onChange({ target: { name: name, value: `${newYear}-${newMonth}` } });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Calendar className={`w-4 h-4 ${error ? "text-red-500" : "text-blue-500"}`} />
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => handlePartChange("month", e.target.value)}
          className={`flex-1 h-10 px-3 border-2 rounded-lg text-sm cursor-pointer outline-none
            ${error 
              ? "border-red-300 bg-red-50 focus:border-red-500" 
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
        >
          <option value="" disabled>Month</option>
          {months.map((m) => (
            <option key={m.val} value={m.val}>{m.label}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => handlePartChange("year", e.target.value)}
          className={`w-1/3 h-10 px-3 border-2 rounded-lg text-sm cursor-pointer outline-none
            ${error 
              ? "border-red-300 bg-red-50 focus:border-red-500" 
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
        >
          <option value="" disabled>Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
};