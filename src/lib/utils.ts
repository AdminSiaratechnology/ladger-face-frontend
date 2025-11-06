import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
interface CheckPermission {
  user?: any;
  companyId?: string; // 👈 added this
  module?: string;
  subModule?: string;
  type?: string;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function checkPermission({
  user,
  companyId,
  module,
  subModule,
  type,
}: CheckPermission) {
  if (!user) return false;
  // 🔓 If user has global/all permissions
  if (user.allPermissions) return true;

  // 🧱 Validate access array
  if (!user.access || user.access.length === 0) return false;

  // 🔍 Find access for the selected company
  const companyAccess = companyId
    ? user.access.find((a: any) => a.company?._id === companyId)
    : user.access[0]; // fallback if no companyId provided

  if (!companyAccess || !companyAccess.modules) return false;

  const moduleAccess = companyAccess.modules[module];
  const subModuleAccess = moduleAccess?.[subModule];
  if (!subModuleAccess) return false;

  if (type?.includes("|")) {
    const types = type.split("|").map((t) => t.trim());
    return types.some((t) => subModuleAccess[t]);
  }

  return subModuleAccess[type] === true;
}
