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
// Branding image interface
export interface BrandingImage {
  type: string;
  file: string;
  fileName: string;
  description?: string;
}
// Branding image form interface
export interface BrandingImageForm {
  id: number;
  type: "banner";
  file?: File;
  fileName: string;
  previewUrl?: string;
  description?: string;
}
// Company interface (updated with brandingImages)
export interface Company {
  id: number;
  _id?: string;
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  code: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax: string;
  email: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  vatNumber?: string;
  msmeNumber?: string;
  udyamNumber?: string;
  defaultCurrency: string;
  banks: Bank[];
  logo: string | null;
  notes: string;
  bookStartingDate?: string;
  financialDate?: string;
  createdAt: string;
  registrationDocs: RegistrationDocument[];
  brandingImages?: BrandingImage[];
  status: "active" | "inactive";
  autoApprove?: boolean;
  maintainAgent?:boolean
}
// Form interface (updated with brandingImages)
export interface CompanyForm {
  namePrint: string;
  nameStreet: string;
  address1: string;
  address2: string;
  address3: string;
  code: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  telephone: string;
  mobile: string;
  fax?: string;
  email: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  vatNumber?: string;
  msmeNumber?: string;
  udyamNumber?: string;
  defaultCurrency: string;
  banks: Bank[];
  logoFile?: File; // For logo upload
  logoPreviewUrl?: string;
  notes: string;
  bookStartingDate?: string;
  financialDate?: string;
  registrationDocs: RegistrationDocument[];
  brandingImages: BrandingImageForm[];
  status: "active" | "inactive";
  maintainGodown?: boolean;
  maintainBatch?: boolean;
  closingQuantityOrder?: boolean;
  negativeOrder?: boolean;
  autoApprove?: boolean;
  maintainAgent?:boolean;
}
// Registration document interface (unchanged)
export interface RegistrationDocument {
  id: number;
  type: string;
  file: File;
  fileName: string;
  previewUrl: string;
}