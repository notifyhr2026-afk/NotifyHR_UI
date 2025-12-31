export interface Feature {
  id: number;
  name: string;
  group: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly" | "custom";
  employeeLimit: number;
  storageLimit: number; // GB
  apiLimit: number;
  features: number[]; // feature IDs
}
