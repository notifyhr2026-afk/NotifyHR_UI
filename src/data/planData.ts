import { Feature, Plan } from "../types/PlanTypes";

export const featuresList: Feature[] = [
  { id: 1, name: "Employee Management", group: "Core" },
  { id: 2, name: "Payroll Processing", group: "Finance" },
  { id: 3, name: "Attendance Tracking", group: "Core" },
  { id: 4, name: "API Access", group: "Developer" },
];

export const plansMock: Plan[] = [
  {
    id: 1,
    name: "Starter",
    price: 10,
    billingCycle: "monthly",
    employeeLimit: 50,
    storageLimit: 10,
    apiLimit: 1000,
    features: [1, 3]
  },
  {
    id: 2,
    name: "Pro",
    price: 50,
    billingCycle: "yearly",
    employeeLimit: 200,
    storageLimit: 100,
    apiLimit: 10000,
    features: [1, 2, 3, 4]
  }
];
