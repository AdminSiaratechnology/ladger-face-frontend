// components/UserManagement/types/userManagementTypes.ts
export interface Company {
  id: string;
  _id: string;
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  msmeNumber: string;
  udyamNumber: string;
  defaultCurrency: string;
  banks: Bank[];
  logo: any;
  notes: string;
  createdAt: string;
  registrationDocs: any[];
}

export interface Bank {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode: string;
  micrNumber: string;
  bankName: string;
  branch: string;
}

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  extra: string[];
}

export interface Module {
  [key: string]: Permission;
}

export interface ModuleAccess {
  [moduleName: string]: Module;
}

export interface Access {
  company: string | Company;
  modules: ModuleAccess;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  subRole: string[];
  allPermissions: boolean;
  parent: string;
  createdBy: string;
  clientID: string;
  company?: string;
  access: Access[];
  phone?: string;
  area?: string;
  pincode?: string;
  status?: "active" | "inactive";
  lastLogin?: string | null;
  createdAt?: string;
  clientAgent?: string;
}

export interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  subRole: string[];
  allPermissions: boolean;
  parent: string;
  createdBy?: string;
  clientID: string;
  company?: string;
  access: Access[];
  phone: string;
  area: string;
  pincode: string;
  status: string;
  clientAgent?: string;
}

export interface PermissionTemplates {
  [key: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}