import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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
  isLogin: boolean | undefined;
}

const CompanySelectorModal = ({
  open,
  defaultSelected,
  onSelect,
  onClose,
  onConfirmNavigate,
  isLogin = false,
}: CompanySelectorModalProps) => {
  const { companies, filterCompanies, loading, pagination } = useCompanyStore();
  const { user } = useAuthStore();

  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelected || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy] = useState<"nameAsc" | "nameDesc" | "dateDesc" | "dateAsc">(
    "nameAsc"
  );
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [noRights, setNoRights] = useState(false);

  // ✅ Filter companies based on permission
  useEffect(() => {
    if (!user) return;

    // case 1 — user has all permissions
    if (user.allPermissions) {
      setFilteredCompanies(companies);
      setNoRights(false);
      return;
    }

    // case 2 — user has limited access
    if (Array.isArray(user.access) && user.access.length > 0) {
      // ✅ Directly map the populated companies
      const accessibleCompanies = user.access
        .filter((a: any) => a.company) // safety check
        .map((a: any) => ({
          _id: a.company._id,
          namePrint: a.company.namePrint,
          nameStreet: a.company.nameStreet,
          logo: a.company.logo,
          code: a.company.code,
        }));

      setFilteredCompanies(accessibleCompanies);
      setNoRights(false);
      return;
    }

    // case 3 — no permissions at all
    setFilteredCompanies([]);
    setNoRights(true);
  }, [user, companies]);

  // ✅ Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user && (searchTerm.length >= 3 || searchTerm.length === 0)) {
        filterCompanies(
          searchTerm,
          statusFilter,
          sortBy,
          "",
          1,
          10,
          isLogin
        ).catch((err) => console.error("Error filtering companies:", err));
      } else if (
        searchTerm.length === 0 &&
        user &&
        companies.length < Math.min(10, pagination?.total)
      ) {
        filterCompanies("", statusFilter, sortBy, "", 1, 10, isLogin).catch(
          (err) => console.error("Error fetching all companies:", err)
        );
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, sortBy, filterCompanies]);

  useEffect(() => {
    setSelectedId(defaultSelected || null);
  }, [defaultSelected]);

  const handleConfirm = useCallback(() => {

    const selectedCompany = companies.find((c) => c._id === selectedId);
    console.log(selectedCompany, "selectedCompany");
    if (selectedCompany) {
      console.log("second");
      onSelect(selectedCompany);
      if (onConfirmNavigate) onConfirmNavigate();
    }
  }, [selectedId, companies, onSelect, onConfirmNavigate]);

  // ✅ No-rights view
  if (noRights) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="max-w-md text-center py-10 px-6 bg-gradient-to-b from-gray-50 to-white border border-gray-200 shadow-lg rounded-2xl"
          onInteractOutside={(e) => e.preventDefault()} // keep modal fixed
        >
          <div className="flex flex-col items-center space-y-5">
            {/* 🏢 Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 border border-teal-100">
              <Building2 className="w-8 h-8 text-teal-600" />
            </div>

            {/* ✨ Title */}
            <h2 className="text-lg font-semibold text-gray-800">
              No Access Rights
            </h2>

            {/* 💬 Message */}
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              It seems you don’t have access permissions assigned yet.
              <br />
              Please contact your administrator to enable your account.
            </p>

            {/* ─ Divider */}
            <div className="w-2/3 h-px bg-gray-100 my-2"></div>

            {/* ✅ Single button */}
            <Button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 shadow-md"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => {
          if (isLogin) e.preventDefault();
        }}
      >
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

        {/* ✅ Search Bar */}
        <div className="relative mt-2 mb-3">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search company"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ✅ Company List */}
        <ScrollArea className="max-h-[400px] mt-2">
          <div className="pr-4 flex flex-col gap-2">
            {loading ? (
              <p className="text-center text-gray-500 text-sm mt-4">
                Loading companies...
              </p>
            ) : filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
                <CardHeader
                  key={company._id}
                  onClick={() => setSelectedId(company._id)}
                  className={`bg-gradient-to-r from-teal-50 to-teal-100 pb-4 hover:from-teal-100 hover:to-teal-200 capitalize cursor-pointer ${
                    selectedId === company._id
                      ? "from-teal-100 to-teal-300"
                      : ""
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
                        {company.code && (
                          <p className="text-gray-500 text-xs mt-1">
                            Code: {company.code}
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
