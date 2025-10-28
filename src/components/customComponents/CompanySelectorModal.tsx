import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "../ui/card";
import CustomFormDialogHeader from "./CustomFromDialogHeader";
import { Building2, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useCompanyStore, type Company } from "../../../store/companyStore";
import { useAuthStore } from "../../../store/authStore";

interface CompanySelectorModalProps {
  open: boolean;
  defaultSelected?: string | null;
  onSelect: (company: Company) => void;
  onClose: () => void;
  onConfirmNavigate?: () => void;
}

const CompanySelectorModal = ({
  open,
  defaultSelected,
  onSelect,
  onClose,
  onConfirmNavigate,
}: CompanySelectorModalProps) => {
  const {
    companies,
    filterCompanies,
    loading,
  } = useCompanyStore();
  const { user } = useAuthStore();

  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelected || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy] = useState<"nameAsc" | "nameDesc" | "dateDesc" | "dateAsc">(
    "nameAsc"
  );

  // ✅ Fetch initial companies (default view)
  useEffect(() => {
    if(user){
    filterCompanies("", statusFilter, sortBy, "68c1503077fd742fa21575df");
    }
    console.log("first")
  }, [filterCompanies, statusFilter, sortBy]);

  // ✅ Debounced search trigger
useEffect(() => {
  const handler = setTimeout(() => {
    if (user && searchTerm.length >= 3) {
      filterCompanies(searchTerm, statusFilter, sortBy, "68c1503077fd742fa21575df")
        .catch((err) => console.error("Error filtering companies:", err));
    } else if (searchTerm.length === 0 && user) {
      // Optional: fetch all companies again when search is cleared
      filterCompanies("", statusFilter, sortBy, "68c1503077fd742fa21575df")
        .catch((err) => console.error("Error fetching all companies:", err));
    }
  }, 500); // ⏳ debounce

  return () => clearTimeout(handler);
}, [searchTerm, statusFilter, sortBy, filterCompanies]);


  useEffect(() => {
    setSelectedId(defaultSelected || null);
  }, [defaultSelected]);

  const handleConfirm = useCallback(() => {
    const selectedCompany = companies.find((c) => c._id === selectedId);
    if (selectedCompany) {
      onSelect(selectedCompany);
      if (onConfirmNavigate) onConfirmNavigate();
    }
  }, [selectedId, companies, onSelect, onConfirmNavigate]);

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
            showCompany={false}
          />
        </DialogHeader>

        {/* ✅ Search Bar (Triggers backend) */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search company "
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="max-h-[400px] mt-2">
          <div className="pr-4 flex flex-col gap-2">
            {loading ? (
              <p className="text-center text-gray-500 text-sm mt-4">
                Loading companies...
              </p>
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <CardHeader
                  key={company._id}
                  onClick={() => setSelectedId(company._id)}
                  className={`bg-gradient-to-r from-teal-50 to-teal-100 pb-4 hover:from-teal-100 hover:to-teal-200 capitalize cursor-pointer ${
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
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm mt-4">
                No companies found.
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end mt-4 gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="bg-teal-600 hover:bg-teal-700 cursor-pointer"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanySelectorModal;
