import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Building2, Search, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState, useEffect, useCallback, memo } from "react";
import { useCompanyStore, type Company } from "../../../store/companyStore";
import { useAuthStore } from "../../../store/authStore";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility (standard in shadcn)

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

  // Store the full company object or null
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy] = useState<"nameAsc" | "nameDesc" | "dateDesc" | "dateAsc">("nameAsc");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [noRights, setNoRights] = useState(false);
  console.log("isLogin in CompanySelectorModal:");

  // 1. Handle Permissions
  useEffect(() => {
    if (!user) return;

    if (user.allPermissions) {
      setFilteredCompanies(companies);
      setNoRights(false);
      return;
    }

    if (Array.isArray(user.access) && user.access.length > 0) {
      const accessibleCompanies = user.access
        .filter((a: any) => a.company)
        .map((a: any) => ({
          ...a.company, // Ensure we keep all company props
          _id: a.company._id,
          namePrint: a.company.namePrint,
          nameStreet: a.company.nameStreet,
          logo: a.company.logo,
          code: a.company.code,
          maintainAgent:a?.company?.maintainAgent|| false,

        }));

      setFilteredCompanies(accessibleCompanies);
      setNoRights(false);
      return;
    }

    setFilteredCompanies([]);
    setNoRights(true);
  }, [user, companies]);

  // 2. Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (user && (searchTerm.length >= 3 || searchTerm.length === 0)) {
        filterCompanies(searchTerm, statusFilter, sortBy, "", 1, 10, isLogin)
          .catch((err) => console.error("Error filtering companies:", err));
      } else if (searchTerm.length === 0 && user && companies.length < Math.min(10, pagination?.total || 0)) {
        // Refetch if list is empty and we cleared search
         filterCompanies("", statusFilter, sortBy, "", 1, 10, isLogin)
           .catch((err) => console.error("Error fetching all companies:", err));
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, sortBy, filterCompanies]);

  // 3. Sync Default Selection
  useEffect(() => {
    if (defaultSelected && filteredCompanies.length > 0) {
       const found = filteredCompanies.find(c => c._id === defaultSelected);
       if (found) setSelectedCompany(found);
    } else {
        setSelectedCompany(null);
    }
  }, [defaultSelected, filteredCompanies]);

  const handleConfirm = useCallback(() => {
    if (selectedCompany) {
      onSelect(selectedCompany);
      if (onConfirmNavigate) onConfirmNavigate();
    }
  }, [selectedCompany, onSelect, onConfirmNavigate]);

  // --- No Rights View ---
  if (noRights) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
           <div className="bg-white p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You do not have permission to access any companies. Please contact your administrator.
            </p>
            <Button onClick={onClose} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              Close
            </Button>
           </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md p-0 gap-0 bg-white border shadow-2xl rounded-2xl overflow-hidden"
        onInteractOutside={(e) => isLogin && e.preventDefault()}
      >
        {/* Header Section */}
        <div className="p-6 pb-4 border-b bg-gray-50/50">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Building2 className="w-5 h-5 text-teal-700" />
              </div>
              Select Workspace
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Choose the company account you wish to manage.
            </p>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or code..."
              className="pl-9 bg-white border-gray-200 focus-visible:ring-teal-500/30 focus-visible:border-teal-500 transition-all rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Section */}
        <ScrollArea className="h-[380px] bg-white">
          <div className="p-4 flex flex-col gap-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 opacity-60">
                <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading workspaces...</p>
              </div>
            ) : filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => {
                const isSelected = selectedCompany?._id === company._id;
                return (
                  <div
                    key={company._id}
                    onClick={() => setSelectedCompany(company)}
                    className={cn(
                      "group relative flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 ease-in-out",
                      isSelected 
                        ? "border-teal-600 bg-teal-50/40 shadow-[0_0_0_1px_rgba(13,148,136,1)]" 
                        : "border-gray-100 hover:border-teal-200 hover:bg-gray-50 hover:shadow-sm"
                    )}
                  >
                    {/* Logo / Avatar */}
                    <div className="shrink-0 mr-4">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                          {company.namePrint?.charAt(0).toUpperCase() || "C"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold text-sm truncate", 
                        isSelected ? "text-teal-900" : "text-gray-900"
                      )}>
                        {company.namePrint}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        {company.code && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                            {company.code}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 truncate">
                          {company.nameStreet || "No address listed"}
                        </p>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="shrink-0 ml-3 animate-in zoom-in-50 duration-200">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 fill-teal-50" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium text-sm">No companies found</p>
                <p className="text-gray-500 text-xs mt-1">Try adjusting your search terms.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex items-center justify-between gap-3">
           <Button 
             variant="ghost" 
             onClick={onClose} 
             className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
           >
             Cancel
           </Button>
           <Button
             onClick={handleConfirm}
             disabled={!selectedCompany}
             className={cn(
                "flex-1 rounded-xl transition-all font-medium shadow-sm",
                !selectedCompany 
                    ? "bg-gray-100 text-gray-400" 
                    : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200"
             )}
           >
             {selectedCompany ? `Access ${selectedCompany.namePrint}` : "Select a Company"}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default memo(CompanySelectorModal);