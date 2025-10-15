// components/CompanySelectorModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Company } from "../../../store/companyStore";
import { useState, useEffect } from "react";
import { CardHeader, CardTitle } from "../ui/card";
import CustomFormDialogHeader from "./CustomFromDialogHeader";
import { Building2 } from "lucide-react";

interface CompanySelectorModalProps {
  open: boolean;
  companies: Company[];
  defaultSelected?: string | null;
  onSelect: (company: Company) => void;
  onClose: () => void;
  onConfirmNavigate?: () => void; // NEW: Optional callback to run after confirm
}

const CompanySelectorModal = ({
  open,
  companies,
  defaultSelected,
  onSelect,
  onClose,
  onConfirmNavigate,
}: CompanySelectorModalProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelected || null
  );

  useEffect(() => {
    setSelectedId(defaultSelected || null);
  }, [defaultSelected]);

  const handleConfirm = () => {
    const selectedCompany = companies.find((c) => c._id === selectedId);
    if (selectedCompany) {
      onSelect(selectedCompany);

      // Call navigation or any other callback after selection
      if (onConfirmNavigate) {
        onConfirmNavigate();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <CustomFormDialogHeader
            title="Select a Company"
            subtitle="Please choose the company you want to manage"
            icon={<Building2 className="w-4 h-4" />}
            gradientFrom="from-teal-500"
            gradientTo="to-teal-300"
          />
        </DialogHeader>
        <ScrollArea className="max-h-[400px] mt-4">
          <div className="pr-4 flex flex-col gap-2">
            {companies.map((company) => (
              <CardHeader
                onClick={() => setSelectedId(company._id)}
                className={`bg-gradient-to-r from-teal-50 to-teal-100 pb-4 hover:from-teal-100 hover:to-teal-200 capitalize cursor-pointer  ${
                  selectedId === company._id ? "from-teal-100 to-teal-300" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt="Company Logo"
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-sm font-bold text-gray-800 mb-1">
                        {company.namePrint}
                      </CardTitle>
                      {company.nameStreet && (
                        <p className="text-teal-600 text-sm font-medium">
                          {company.nameStreet}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId} className="bg-teal-600 hover:bg-teal-700 cursor-pointer ">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanySelectorModal;
