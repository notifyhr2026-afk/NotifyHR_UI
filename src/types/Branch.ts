export interface Branch {
  BranchID: number;
  OrganizationID: number;
  BranchName: string;
  AddressLine1: string;
  AddressLine2: string;
  AddressLine3: string;
  City: string;
  State: string;
  Country: string;
  PostalCode: string;
  Phone1: string;
  Phone2: string;
  Email: string;
  IsHeadOffice: boolean;
  IsActive: boolean;
  IsDeleted:boolean;
  CreatedBy:string;
}
