import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

type Props = {
  count: number;
  onClear: () => void;
  onFilter: () => void;
};

export default function ReportFilterActions({
  count,
  onClear,
  onFilter,
}: Props) {
  return (
    <div className="flex gap-3">
      {/* CLEAR BUTTON */}
      <Button
        variant="outline"
        onClick={onClear}
        className="h-9 px-3 py-1.5 rounded-lg cursor-pointer
                   text-red-600 border-red-300 hover:bg-red-50"
      >
        <X className="w-4 h-4 mr-2" />
        Clear
      </Button>

      {/* FILTER BUTTON */}
      <Button
        variant="outline"
        onClick={onFilter}
        className="h-9 px-3 py-4.5 rounded-lg cursor-pointer
                    hover:bg-gray-100"
      >
        <Filter className="w-2 h-4 " />
        Filter Report
        {count > 0 && (
          <Badge className=" bg-teal-600 text-white">
            {count}
          </Badge>
        )}
      </Button>
    </div>
  );
}
