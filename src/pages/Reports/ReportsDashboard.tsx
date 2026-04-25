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

// ================= DATA CONFIG =================
const REPORTS: ReportLink[] = [
  // Org Admin Reports
  { id: 1, title: "Organization Master", description: "Entity & branch directory", icon: <FileText size={24}/>, roles: ["OrgAdmin"], path: "#" },
  { id: 2, title: "Audit Trail", description: "System change logs", icon: <ShieldCheck size={24}/>, roles: ["OrgAdmin"], path: "#" },
  
  // HR Manager Reports
  { id: 3, title: "Employee Master", description: "Complete staff directory", icon: <FileText size={24}/>, roles: ["OrgAdmin", "HRManager"], path: "#" },
  { id: 4, title: "Leave Balance", description: "Accrued vs Used leave", icon: <Clock size={24}/>, roles: ["HRManager", "Employee"], path: "#" },
  { id: 5, title: "Asset Register", description: "Company property tracking", icon: <Briefcase size={24}/>, roles: ["HRManager"], path: "#" },
  
  // Payroll Reports
  { id: 6, title: "Salary Register", description: "Monthly Gross-to-Net", icon: <CreditCard size={24}/>, roles: ["OrgAdmin", "PayrollManager"], path: "#" },
  { id: 7, title: "Statutory Reports", description: "PF, ESI & Tax Filing", icon: <FileText size={24}/>, roles: ["PayrollManager"], path: "#" },
  
  // Employee Reports
  { id: 8, title: "My Payslips", description: "View/Download past slips", icon: <FileText size={24}/>, roles: ["Employee"], path: "#" },
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
