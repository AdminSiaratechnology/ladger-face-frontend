import React, { memo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"; // Adjust path
import { Badge } from "../ui/badge"; // Adjust path
// import ActionsDropdown from "./ActionsDropdown"; // Adjust path
// import { CheckAccess } from "./CheckAccess"; // Adjust path
import {
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCheck,
  FileText,
} from "lucide-react";
import { CheckAccess } from "../customComponents/CheckAccess";
import ActionsDropdown from "../customComponents/ActionsDropdown";

// ----------------------------------------------------------------------
// 🔹 TYPE DEFINITIONS
// ----------------------------------------------------------------------

export interface BaseCardItem {
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
  zipCode?: string;
  website?: string;
  contactPerson?: string;
  logo?: string | null;
  createdAt?: string | Date;
  [key: string]: any; // Allow other properties
}

export interface CardActions<T> {
  onView: (item: T) => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}

interface CommonCardProps<T extends BaseCardItem> {
  data: T[];
  actions: CardActions<T>;
  module: string;
  subModule: string;
  
  // OPTIONAL: Custom renderers for specific sections
  renderExtraContent?: (item: T) => ReactNode; // For things like Performance Stars, Stats
  renderBottomSection?: (item: T) => ReactNode; // For things like GST/PAN at the bottom
}

// ----------------------------------------------------------------------
// 🔹 SINGLE CARD COMPONENT
// ----------------------------------------------------------------------

const SingleCard = <T extends BaseCardItem>({
  item,
  actions,
  module,
  subModule,
  renderExtraContent,
  renderBottomSection,
}: {
  item: T;
  actions: CardActions<T>;
  module: string;
  subModule: string;
  renderExtraContent?: (item: T) => ReactNode;
  renderBottomSection?: (item: T) => ReactNode;
}) => {
  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {item.logo ? (
              <img
                src={item.logo}
                alt={`${item.name} Logo`}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full mr-3 bg-teal-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-teal-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
               {item.name.length > 15
    ? item.name.slice(0, 15) + "..."
    : item.name}
              </CardTitle>
              {item.shortName && (
                <p className="text-teal-600 font-medium">{item.shortName}</p>
              )}
              <p className="text-sm text-gray-500">{item.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                item.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              } hover:bg-current`}
            >
              {item.status}
            </Badge>
            <CheckAccess
              module={module}
              subModule={subModule}
              type="update" // Assuming update permission covers edit/delete view
            >
              <ActionsDropdown
                onView={() => actions.onView(item)}
                onEdit={() => actions.onEdit(item)}
                onDelete={() => actions.onDelete(item._id || String(item.id))}
                module={module}
                subModule={subModule}
              />
            </CheckAccess>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          {/* Contact Person */}
          {item.contactPerson && (
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-gray-600">{item.contactPerson}</span>
            </div>
          )}

          {/* Location */}
          {(item.city || item.state || item.zipCode) && (
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-gray-600">
                {[item.city, item.state, item.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}

          {/* Mobile */}
          {item.mobileNumber && (
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-gray-600">{item.mobileNumber}</span>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center text-sm">
            <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-600 truncate">{item.emailAddress}</span>
          </div>

          {/* Website */}
          {item.website && (
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
              <span className="text-teal-600 truncate">{item.website}</span>
            </div>
          )}
        </div>

        {/* ⚡ Custom Content Slot (e.g., Performance Stars for Agents) */}
        {renderExtraContent && (
          <div className="pt-3 border-t border-gray-100">
            {renderExtraContent(item)}
          </div>
        )}

        {/* ⚡ Bottom Section Slot (e.g., Tax Info for Vendors) */}
        {renderBottomSection && (
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {renderBottomSection(item)}
          </div>
        )}

        {/* Created At Footer */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm">
            <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-gray-600">
              Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ----------------------------------------------------------------------
// 🔹 MAIN GRID COMPONENT
// ----------------------------------------------------------------------

const CommonCard = <T extends BaseCardItem>({
  data,
  actions,
  module,
  subModule,
  renderExtraContent,
  renderBottomSection,
}: CommonCardProps<T>) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {data.map((item) => (
        <SingleCard
          key={item._id || item.id}
          item={item}
          actions={actions}
          module={module}
          subModule={subModule}
          renderExtraContent={renderExtraContent}
          renderBottomSection={renderBottomSection}
        />
      ))}
    </div>
  );
};

export default memo(CommonCard) as typeof CommonCard;