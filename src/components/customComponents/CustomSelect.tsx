import React from "react";

interface CustomSelectProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: any;
  placeholder?: string;
  required?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
}) => {
  console.log(options,"optionsssss")
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label} {required && "*"}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 py-2 border border-teal-200 rounded-md 
                   focus:border-teal-500 focus:ring-teal-100 focus:outline-none bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option._id|| option}>
            {option._id?(option.name|| option.namePrint):option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
