import React from 'react';

interface TableHeaderProps {
  headers: string[];
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  headers,
  gradientFrom = "from-teal-50",
  gradientTo = "to-teal-100",
  className = ""
}) => {
  return (
    <thead className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} ${className}`}>
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;