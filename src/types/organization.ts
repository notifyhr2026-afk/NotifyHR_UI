export interface Organization {
    OrganizationID: number;
    OrganizationName: string;
    Email?: string;
    Phone?: string;
    Website?: string;
    Industry: string;
    OrganizationTypeID: number;
    CreatedBy: string;
    CreatedAt: string | null; // or Date if parsed
    ModifiedBy?: string | null;
    ModifiedAt?: string | null;
    IsActive: boolean;
    IsDeleted: boolean;
}
