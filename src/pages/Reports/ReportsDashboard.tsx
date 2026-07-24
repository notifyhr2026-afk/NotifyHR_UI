import React, { useState } from "react";
import { Card, Row, Col, Container, Badge } from "react-bootstrap";
import { 
  FileText,  CreditCard, ShieldCheck, 
  Clock,   Briefcase 
} from "react-bootstrap-icons"; // Using standard bootstrap icons

// ================= TYPES =================
type Role = "OrgAdmin" | "HRManager" | "PayrollManager" | "Employee";

interface ReportLink {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  roles: Role[];
  path: string;
}

const REPORTS: ReportLink[] = [
  // ================= ORG ADMIN =================
  {
    id: 1,
    title: "Organization Master",
    description: "Organization, Branches & Departments",
    icon: <FileText size={24} />,
    roles: ["OrgAdmin"],
    path: "/reports/organization-master",
  },
  {
    id: 2,
    title: "Employee Master",
    description: "Complete employee directory",
    icon: <FileText size={24} />,
    roles: ["OrgAdmin", "HRManager"],
    path: "/reports/employee-master",
  },
  {
    id: 3,
    title: "Department Report",
    description: "Department wise employees",
    icon: <Briefcase size={24} />,
    roles: ["OrgAdmin", "HRManager"],
    path: "/reports/department-report",
  },
  {
    id: 4,
    title: "Audit Trail",
    description: "System activity logs",
    icon: <ShieldCheck size={24} />,
    roles: ["OrgAdmin"],
    path: "/reports/audit-trail",
  },

  // ================= HR =================
  {
    id: 5,
    title: "Attendance Register",
    description: "Monthly attendance",
    icon: <Clock size={24} />,
    roles: ["HRManager"],
    path: "/reports/attendance-register",
  },
  {
    id: 6,
    title: "Leave Balance",
    description: "Leave balance report",
    icon: <Clock size={24} />,
    roles: ["HRManager", "Employee"],
    path: "/reports/leave-balance",
  },
  {
    id: 7,
    title: "Leave History",
    description: "Applied leave history",
    icon: <Clock size={24} />,
    roles: ["HRManager"],
    path: "/reports/leave-history",
  },
  {
    id: 8,
    title: "Asset Register",
    description: "Assigned company assets",
    icon: <Briefcase size={24} />,
    roles: ["HRManager"],
    path: "/reports/assets",
  },
  {
    id: 9,
    title: "Employee Directory",
    description: "Contact directory",
    icon: <FileText size={24} />,
    roles: ["HRManager", "OrgAdmin"],
    path: "/reports/employee-directory",
  },

  // ================= PAYROLL =================
  {
    id: 10,
    title: "Salary Register",
    description: "Monthly salary register",
    icon: <CreditCard size={24} />,
    roles: ["PayrollManager", "OrgAdmin"],
    path: "/reports/salary-register",
  },
  {
    id: 11,
    title: "Payroll Summary",
    description: "Payroll overview",
    icon: <CreditCard size={24} />,
    roles: ["PayrollManager", "OrgAdmin"],
    path: "/reports/payroll-summary",
  },
  {
    id: 12,
    title: "Bank Transfer",
    description: "Salary bank advice",
    icon: <CreditCard size={24} />,
    roles: ["PayrollManager"],
    path: "/reports/bank-transfer",
  },
  {
    id: 13,
    title: "PF Report",
    description: "Provident Fund",
    icon: <FileText size={24} />,
    roles: ["PayrollManager"],
    path: "/reports/pf",
  },
  {
    id: 14,
    title: "ESI Report",
    description: "Employee State Insurance",
    icon: <FileText size={24} />,
    roles: ["PayrollManager"],
    path: "/reports/esi",
  },
  {
    id: 15,
    title: "Professional Tax",
    description: "PT deduction report",
    icon: <FileText size={24} />,
    roles: ["PayrollManager"],
    path: "/reports/professional-tax",
  },
  {
    id: 16,
    title: "TDS Report",
    description: "Income tax deductions",
    icon: <FileText size={24} />,
    roles: ["PayrollManager"],
    path: "/reports/tds",
  },
  // {
  //   id: 17,
  //   title: "Loan Deduction",
  //   description: "Loan EMI report",
  //   icon: <CreditCard size={24} />,
  //   roles: ["PayrollManager"],
  //   path: "/reports/loan-deduction",
  // },
  // {
  //   id: 18,
  //   title: "Bonus Report",
  //   description: "Bonus & Incentives",
  //   icon: <CreditCard size={24} />,
  //   roles: ["PayrollManager"],
  //   path: "/reports/bonus",
  // },

  // ================= EMPLOYEE =================
  // {
  //   id: 19,
  //   title: "My Payslips",
  //   description: "View and download payslips",
  //   icon: <FileText size={24} />,
  //   roles: ["Employee"],
  //   path: "/employee/payslips",
  // },
  {
    id: 20,
    title: "Attendance Summary",
    description: "Monthly attendance",
    icon: <Clock size={24} />,
    roles: ["Employee"],
    path: "/employee/attendance",
  },
  {
    id: 21,
    title: "Leave Ledger",
    description: "Leave applications",
    icon: <Clock size={24} />,
    roles: ["Employee"],
    path: "/employee/leave-ledger",
  },
  {
    id: 22,
    title: "My Assets",
    description: "Assigned assets",
    icon: <Briefcase size={24} />,
    roles: ["Employee"],
    path: "/employee/assets",
  },
];


const ReportsDashboard: React.FC = () => {
  // In a real app, get this from your AuthContext or Redux
  // const { userRole } = useAuth(); 
  const [currentRole, setCurrentRole] = useState<Role>("OrgAdmin");

  const filteredReports = REPORTS.filter(r => r.roles.includes(currentRole));

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>Reports Center</h3>
          <p className="text-muted">Select a report to view detailed data tables.</p>
        </div>
        
        {/* ROLE SWITCHER - For testing purposes only */}
        <div className="bg-light p-2 border rounded">
          <small className="d-block mb-1 fw-bold">Switch Role (Testing):</small>
          {["OrgAdmin", "HRManager", "PayrollManager", "Employee"].map((r) => (
            <Badge 
              key={r} 
              bg={currentRole === r ? "primary" : "secondary"}
              className="me-1 cursor-pointer" 
              style={{ cursor: 'pointer' }}
              onClick={() => setCurrentRole(r as Role)}
            >
              {r}
            </Badge>
          ))}
        </div>
      </div>

      <Row>
        {filteredReports.map((report) => (
          <Col key={report.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
            <a href={report.path} className="text-decoration-none text-dark">
              <Card className="h-100 shadow-sm report-card">
                <Card.Body className="text-center py-4">
                  <div className="mb-3 text-primary">
                    {report.icon}
                  </div>
                  <Card.Title className="h6 mb-2">{report.title}</Card.Title>
                  <Card.Text className="small text-muted">
                    {report.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </a>
          </Col>
        ))}
      </Row>

      <style>{`
        .report-card {
          transition: all 0.2s ease-in-out;
          border: 1px solid #eee;
        }
        .report-card:hover {
          transform: translateY(-5px);
          border-color: #0d6efd;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </Container>
  );
};

export default ReportsDashboard;
