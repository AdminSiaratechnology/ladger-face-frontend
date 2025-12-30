import React, { memo, ReactNode } from "react";
import { Badge } from "../ui/badge"; // Adjust path based on your folder structure
import TableHeader from "../customComponents/CustomTableHeader";
import ActionsDropdown from "../customComponents/ActionsDropdown";
import { UserCheck } from "lucide-react";
// Adjust path


// ----------------------------------------------------------------------
// 🔹 TYPE DEFINITIONS
// ----------------------------------------------------------------------

// Interface for the minimum required fields in your data objects
export interface BaseTableItem {
  _id?: string;
  id?: number | string;
  status: string;
  name: string;
  code: string;
  shortName?: string;
  emailAddress?: string;
  mobileNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  addressLine1?: string;
  [key: string]: any; // Allow other properties
}

export interface TableActions<T> {
  onView: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

interface CommonTableProps<T extends BaseTableItem> {
  headers: string[];
  data: T[];
  actions: TableActions<T>;
  module: string;
  subModule: string;
  
  // Optional Custom Renderers (Slot Pattern)
  // If not provided, it falls back to the default layout
  renderIdentity?: (item: T) => ReactNode;
  renderContact?: (item: T) => ReactNode;
  renderLocation?: (item: T) => ReactNode;
}

// ----------------------------------------------------------------------
// 🔹 DEFAULT RENDERERS (Fallback UI for Vendor/Ledger)
// ----------------------------------------------------------------------

const DefaultIdentity = ({ item }: { item: BaseTableItem }) => (
//   <div>
//     <div className="text-sm font-medium text-gray-900">{item.name}</div>
//     <div className="text-sm text-gray-500">{item.code}</div>
//     {item.shortName && (
//       <div className="text-sm text-gray-500">Short: {item.shortName}</div>
//     )}
//   </div>
  <div className="flex items-center gap-2 ">
          {item.logo ? (
              <img
              src={item.logo}
              alt="Agent Logo"
              className="h-7 w-7 rounded-full mr-3 object-cover"
            />
          ) : (
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
          )}
        <div>
          <div className="text-sm font-medium text-gray-900">{item.name}</div>
          <div className="text-sm text-teal-600">{item.code}</div>
          {item.shortName && (
            <div className="text-xs text-gray-500">
              Short: {item.shortName}
            </div>
          )}
        </div>
      </div>

);

const DefaultContact = ({ item }: { item: BaseTableItem }) => (
  <div className="text-sm text-gray-900">
    <div>Email: {item.emailAddress}</div>
    <div>Phone: {item.mobileNumber || item.phoneNumber}</div>
  </div>
);

const DefaultLocation = ({ item }: { item: BaseTableItem }) => (
  <div className="text-sm text-gray-900">
    {[item.city, item.state, item.country].filter(Boolean).join(", ")}
  </div>
);

// ----------------------------------------------------------------------
// 🔹 MEMOIZED TABLE ROW (Performance Optimization)
// ----------------------------------------------------------------------

interface TableRowProps<T> {
  item: T;
  renderIdentity?: (item: T) => ReactNode;
  renderContact?: (item: T) => ReactNode;
  renderLocation?: (item: T) => ReactNode;
  actions: TableActions<T>;
  module: string;
  subModule: string;
}

// We use a generic function wrapper to allow proper typing inside Memo
const TableRow = <T extends BaseTableItem>({
  item,
  renderIdentity,
  renderContact,
  renderLocation,
  actions,
  module,
  subModule,
}: TableRowProps<T>) => {
  
  // Decide which component to render
  const IdentityComponent = renderIdentity ? () => <>{renderIdentity(item)}</> : () => <DefaultIdentity item={item} />;
  const ContactComponent = renderContact ? () => <>{renderContact(item)}</> : () => <DefaultContact item={item} />;
  const LocationComponent = renderLocation ? () => <>{renderLocation(item)}</> : () => <DefaultLocation item={item} />;

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      {/* 1. Identity Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <IdentityComponent />
      </td>

      {/* 2. Contact Column */}
      <td className="px-6 py-4">
        <ContactComponent />
      </td>

      {/* 3. Location Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <LocationComponent />
      </td>

      {/* 4. Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          className={`${
            item.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          } hover:bg-green-100`}
        >
          {item.status}
        </Badge>
      </td>

      {/* 5. Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <ActionsDropdown
          onView={() => actions.onView(item)}
          onEdit={() => actions.onEdit(item)}
          onDelete={() => actions.onDelete(item._id || String(item.id))}
          module={module}
          subModule={subModule}
        />
      </td>
    </tr>
  );
};

// Custom comparison for React.memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.status === nextProps.item.status &&
    prevProps.item.updatedAt === nextProps.item.updatedAt // Assumes your data has timestamps
  );
};

// Cast memoized component to Generic type
const MemoizedTableRow = memo(TableRow, arePropsEqual) as typeof TableRow;

// ----------------------------------------------------------------------
// 🔹 MAIN COMPONENT
// ----------------------------------------------------------------------

const CommonTable = <T extends BaseTableItem>({
  headers,
  data,
  actions,
  module,
  subModule,
  renderIdentity,
  renderContact,
  renderLocation,
}: CommonTableProps<T>) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader headers={headers} />
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <MemoizedTableRow
                key={item._id || item.id}
                item={item}
                actions={actions}
                module={module}
                subModule={subModule}
                renderIdentity={renderIdentity}
                renderContact={renderContact}
                renderLocation={renderLocation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommonTable;