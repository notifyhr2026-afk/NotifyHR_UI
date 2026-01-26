export interface Organization {
  OrganizationID: number;
  OrganizationName: string;
  Email: string;
  Phone: string;
  Website: string;
  Industry: string;
  OrganizationTypeID: number;

  CreatedBy?: string;
  ModifiedBy?: string;
  CreatedAt?: string | null;

  IsActive?: boolean;
  IsDeleted?: boolean;
}
