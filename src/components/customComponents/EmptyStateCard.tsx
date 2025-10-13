import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { CheckAccess } from "./CheckAccess";



interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  buttonLabel?: string;
  module?: string;
  subModule?: string;
  type?: string;
  onButtonClick?: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonLabel,
  module,
  subModule,
  type,
  onButtonClick,
}) => {
  return (
    <Card className="border-2 border-dashed border-gray-300 bg-white/50">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Icon className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium mb-2">{title}</p>
        {description && <p className="text-gray-400 text-sm mb-6">{description}</p>}

        {buttonLabel && onButtonClick && (
          <CheckAccess module={module} subModule={subModule} type={type}>
            <Button
              onClick={onButtonClick}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
            >
              {buttonLabel}
            </Button>
          </CheckAccess>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
