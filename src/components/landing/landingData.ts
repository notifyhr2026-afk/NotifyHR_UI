export const features = [
  { name: "Employee Management", type: "HR", desc: "Maintain employee personal and job records." },
  { name: "Organizational Management", type: "HR", desc: "Departments, roles, designations, reporting." },
  { name: "Document Management", type: "HR", desc: "Secure storage for employee documents." },
  { name: "Asset Management", type: "HR", desc: "Track company assets assigned to employees." },
  { name: "Background Verification", type: "HR", desc: "Verify employee identity and history." },
  { name: "Performance Management", type: "HR", desc: "Goals, reviews, and appraisals." },
  { name: "Policy Management", type: "HR", desc: "HR policies and compliance." },
  { name: "Reports & Analytics", type: "HR", desc: "Real-time HR dashboards." },
  { name: "Helpdesk & Ticketing", type: "HR", desc: "Employee queries with SLA tracking." },

  { name: "Attendance Management", type: "Attendance", desc: "Daily attendance tracking." },
  { name: "Shift Management", type: "Attendance", desc: "Day, night, rotating shifts." },
  { name: "Overtime Management", type: "Attendance", desc: "Automatic OT calculation." },
  { name: "Holiday Calendar", type: "Attendance", desc: "Location-based holidays." },
  { name: "Leave Integration", type: "Attendance", desc: "Attendance synced with leave." },

  { name: "Payroll Management", type: "Payroll", desc: "Accurate monthly payroll." },
  { name: "Tax & Compliance", type: "Payroll", desc: "Statutory compliance & taxes." },
  { name: "Salary Structure", type: "Payroll", desc: "Allowances & deductions." },
  { name: "Payslip Management", type: "Payroll", desc: "Digital payslips." },
  { name: "Payroll Reports", type: "Payroll", desc: "Statutory & salary reports." },

  { name: "Recruitment Management", type: "Recruitment", desc: "Hiring workflows." },
  { name: "Candidate Management", type: "Recruitment", desc: "Track resumes & status." },
  { name: "Interview Management", type: "Recruitment", desc: "Schedule & feedback." },
  { name: "Onboarding", type: "Recruitment", desc: "Joining & induction." },
  { name: "Offer Management", type: "Recruitment", desc: "Digital offer letters." },
];

export const featureGroupIcons: Record<string, string> = {
  HR: "bi-people-fill",
  Attendance: "bi-clock-history",
  Payroll: "bi-cash-stack",
  Recruitment: "bi-person-plus-fill",
};

export const valueProps = [
  {
    icon: "bi-lightning-charge-fill",
    title: "Reduce HR Workload",
    desc: "Automate payroll, attendance, and documentation to save up to 70% administrative time.",
  },
  {
    icon: "bi-bullseye",
    title: "Increase Accuracy",
    desc: "Eliminate manual errors in salary processing and compliance reporting.",
  },
  {
    icon: "bi-heart-pulse-fill",
    title: "Improve Employee Experience",
    desc: "Self-service access for payslips, leave requests, and performance tracking.",
  },
  {
    icon: "bi-shield-lock-fill",
    title: "Enterprise Security",
    desc: "Role-based access, encryption, and compliance-ready infrastructure.",
  },
];

export const businessMetrics = [
  { number: "70%", label: "Reduction in Manual Work" },
  { number: "99.9%", label: "Payroll Accuracy" },
  { number: "50%", label: "Faster Hiring Process" },
  { number: "500+", label: "Growing Organizations" },
];

export const securityFeatures = [
  { icon: "bi-key-fill", title: "Role-Based Access", desc: "Granular permissions for every team and role." },
  { icon: "bi-cloud-check-fill", title: "Secure Cloud", desc: "Enterprise-grade hosting with continuous monitoring." },
  { icon: "bi-lock-fill", title: "Data Encryption", desc: "Encryption in transit and at rest for all employee data." },
  { icon: "bi-file-earmark-check-fill", title: "Compliance Ready", desc: "Built for statutory payroll and HR compliance workflows." },
];

export const howItWorks = [
  { step: "01", title: "Setup Organization", desc: "Configure departments, roles, and policies in minutes." },
  { step: "02", title: "Add Employees", desc: "Import profiles, documents, and org structure at scale." },
  { step: "03", title: "Track & Manage", desc: "Run attendance, payroll, and performance from one hub." },
  { step: "04", title: "Analyze & Improve", desc: "Use real-time reports to drive smarter HR decisions." },
];

export const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#security", label: "Security" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

export const trustLogos = ["Automation", "Compliance", "Real-time Insights", "Enterprise Ready"];
