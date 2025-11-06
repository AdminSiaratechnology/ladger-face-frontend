import { checkPermission } from "../../lib/utils";
import { useAuthStore } from "../../../store/authStore";
import { useCompanyStore } from "../../../store/companyStore";

interface CheckAccessProps {
  children: React.ReactNode;
  module?: string;
  subModule?: string;
  type?: string;
}

export const CheckAccess = ({ children, module, subModule, type }: CheckAccessProps) => {
  const { user, isLoading } = useAuthStore();
  const { defaultSelected } = useCompanyStore(); // ✅ get selected company
  const companyId = defaultSelected?._id;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (module && subModule) {
    const hasPermission = checkPermission({
      user,
      companyId,
      module,
      subModule,
      type,
    });

    if (!hasPermission) {
      return null; // 🚫 Hide if no access
    }
  }

  return <>{children}</>;
};
