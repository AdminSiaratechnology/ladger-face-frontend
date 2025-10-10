import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
interface CheckPermission {
  user?:any,
  module?:string,
  subModule?:string,
  type?:string
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Utility function to check permissions
export function checkPermission({user, module, subModule,type}:CheckPermission) {
  // console.log(user,module,subModule,type,"user,module,subModule,type")
  // If user has all permissions, allow access
  if (user.allPermissions) {
    return true;
  }

  // Check if user has access array and it's not empty
  if (!user.access || user.access.length === 0) {
    return false;
  }

  // Check permissions in the access array
  for (const accessItem of user.access) {
    const modules = accessItem.modules;
    
    if (modules && modules[module] && modules[module][subModule]) {
      return modules[module][subModule]?.[type] === true;
    }
  }

  return false;
}
