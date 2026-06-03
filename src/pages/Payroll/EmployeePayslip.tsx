import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  Alert
} from "react-bootstrap";
// @ts-ignore: jspdf types are not available in this project environment
import { jsPDF } from "jspdf";
import employeeSalaryAssignment from "../../services/employeeSalaryAssignment";

// ---------------------------
// TypeScript Interfaces
// ---------------------------
interface PayslipSummary {
  TotalDays: number;
  PaidDays: number;
  Leaves: number;
  LossOfPay: number;
  GrossEarnings: number;
  TotalDeductions: number;
  NetPay: number;
  MonthName: string;
  PayrollYear: number;
}

interface PayslipComponent {
  ComponentName: string;
  ComponentType: "Earning" | "Deduction";
  Amount: number;
}

// ---------------------------
// Constants for Dropdowns
// ---------------------------
const MONTHS = [
  { val: 1, name: "January" }, { val: 2, name: "February" }, { val: 3, name: "March" },
  { val: 4, name: "April" }, { val: 5, name: "May" }, { val: 6, name: "June" },
  { val: 7, name: "July" }, { val: 8, name: "August" }, { val: 9, name: "September" },
  { val: 10, name: "October" }, { val: 11, name: "November" }, { val: 12, name: "December" }
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i + 1);

// ---------------------------
// PDF Builder — uses real API data
// ---------------------------
const buildPayslipPDF = (
  summary: PayslipSummary,
  components: PayslipComponent[],
  employeeName: string,
  employeeId: number | string
): Blob => {
  const earnings   = components.filter(c => c.ComponentType === "Earning");
  const deductions = components.filter(c => c.ComponentType === "Deduction");
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header bar
  doc.setFillColor(26, 115, 232);
  doc.rect(0, 0, W, 60, "F");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("NotifyHR – Payslip", W / 2, 28, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Pay Period: ${summary.MonthName} ${summary.PayrollYear}`, W / 2, 46, { align: "center" });

  y = 80;

  // Employee info
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Details", 40, y);
  doc.setDrawColor(200, 200, 200);
  doc.line(40, y + 4, W - 40, y + 4);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${employeeName}`, 40, y);
  doc.text(`Employee ID: ${employeeId}`, 40, y + 16);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, W - 40, y, { align: "right" });
  doc.setTextColor(39, 174, 96);
  doc.setFont("helvetica", "bold");
  doc.text("Status: Processed", W - 40, y + 16, { align: "right" });
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "normal");
  y += 48;

  // Attendance box
  doc.setFillColor(232, 240, 254);
  doc.roundedRect(40, y, W - 80, 40, 4, 4, "F");
  const attCols = [
    { label: "Total Days", val: String(summary.TotalDays) },
    { label: "Paid Days",  val: String(summary.PaidDays)  },
    { label: "Leaves",     val: String(summary.Leaves)    },
    { label: "LOP",        val: String(summary.LossOfPay) },
  ];
  const colW = (W - 80) / attCols.length;
  attCols.forEach((col, i) => {
    const cx = 40 + colW * i + colW / 2;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(col.label, cx, y + 14, { align: "center" });
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(col.val, cx, y + 32, { align: "center" });
    doc.setFont("helvetica", "normal");
  });
  y += 56;

  // Earnings & Deductions side by side
  const colLeft   = 40;
  const colRight  = W / 2 + 10;
  const colInnerW = W / 2 - 50;

  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "bold");
  doc.text("EARNINGS", colLeft, y);
  doc.text("DEDUCTIONS", colRight, y);
  doc.setDrawColor(220, 220, 220);
  doc.line(colLeft, y + 3, colLeft + colInnerW, y + 3);
  doc.line(colRight, y + 3, colRight + colInnerW, y + 3);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const maxRows = Math.max(earnings.length, deductions.length);
  for (let i = 0; i < maxRows; i++) {
    if (earnings[i]) {
      doc.text(earnings[i].ComponentName, colLeft, y);
      doc.text(fmt(earnings[i].Amount), colLeft + colInnerW, y, { align: "right" });
    }
    if (deductions[i]) {
      doc.text(deductions[i].ComponentName, colRight, y);
      doc.setTextColor(192, 57, 43);
      doc.text(fmt(deductions[i].Amount), colRight + colInnerW, y, { align: "right" });
      doc.setTextColor(50, 50, 50);
    }
    y += 16;
  }

  // Totals row
  doc.setFillColor(234, 250, 241);
  doc.rect(colLeft, y, colInnerW, 18, "F");
  doc.setFillColor(255, 245, 245);
  doc.rect(colRight, y, colInnerW, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(39, 174, 96);
  doc.text("Gross Earnings", colLeft + 4, y + 12);
  doc.text(fmt(summary.GrossEarnings), colLeft + colInnerW - 4, y + 12, { align: "right" });
  doc.setTextColor(192, 57, 43);
  doc.text("Total Deductions", colRight + 4, y + 12);
  doc.text(fmt(summary.TotalDeductions), colRight + colInnerW - 4, y + 12, { align: "right" });
  y += 32;

  // Net Pay box
  doc.setFillColor(26, 26, 46);
  doc.roundedRect(40, y, W - 80, 54, 6, 6, "F");
  doc.setFontSize(9);
  doc.setTextColor(170, 170, 170);
  doc.setFont("helvetica", "normal");
  doc.text("NET PAYABLE AMOUNT", W / 2, y + 18, { align: "center" });
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(fmt(summary.NetPay), W / 2, y + 42, { align: "center" });

  return doc.output("blob");
};

const EmployeePayslip: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState<number>(new Date().getFullYear());
  const [summary, setSummary]             = useState<PayslipSummary | null>(null);
  const [components, setComponents]       = useState<PayslipComponent[]>([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl]       = useState<string | null>(null);

  const user       = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeID: number | undefined = user?.employeeID;

  const handleViewPayslip = async () => {
    if (!employeeID) return;

    setLoading(true);
    setError(null);
    setSummary(null);
    if (pdfBlobUrl) { URL.revokeObjectURL(pdfBlobUrl); setPdfBlobUrl(null); }

    try {
      const response = await employeeSalaryAssignment.GetEmployeeMonthlyPayslipByEmployeeID(
        employeeID,
        selectedMonth,
        selectedYear
      );

      if (response?.Table?.[0]) {
        const fetchedSummary: PayslipSummary   = response.Table[0];
        const fetchedComponents: PayslipComponent[] = response.Table1 || [];
        setSummary(fetchedSummary);
        setComponents(fetchedComponents);

        // Build PDF from real API data and show in viewer
        const blob = buildPayslipPDF(fetchedSummary, fetchedComponents, user?.name || "Employee", employeeID);
        setPdfBlobUrl(URL.createObjectURL(blob));
      } else {
        setError("No payroll record found for the selected period.");
      }
    } catch (err) {
      console.error("Error fetching payslip:", err);
      setError("Failed to load payslip data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    const monthName = MONTHS.find(m => m.val === selectedMonth)?.name ?? "Payslip";
    a.download = `Payslip_${monthName}_${selectedYear}.pdf`;
    a.click();
  };

  useEffect(() => {
    handleViewPayslip();
  }, []);

  const earnings   = components.filter((c) => c.ComponentType === "Earning");
  const deductions = components.filter((c) => c.ComponentType === "Deduction");

  return (
    <Container className="py-4">
      {/* 1. FILTER SECTION */}
      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Month</Form.Label>
                  <Form.Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {MONTHS.map(m => (
                      <option key={m.val} value={m.val}>{m.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Year</Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={handleViewPayslip}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "View Payslip"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 2. MESSAGES SECTION */}
      {error && <Alert variant="warning" className="text-center">{error}</Alert>}

      {/* 3. PDF VIEWER */}
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : pdfBlobUrl ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-muted" style={{ fontSize: 13 }}>
                Payslip – {MONTHS.find(m => m.val === selectedMonth)?.name} {selectedYear}
              </span>
              <Button variant="success" size="sm" onClick={handleDownloadPDF}>
                ⬇ Download PDF
              </Button>
            </div>
            <iframe
              src={pdfBlobUrl}
              title="Payslip PDF"
              style={{ width: "100%", height: 600, border: "1px solid #dee2e6", borderRadius: 6 }}
            />
          </Card.Body>
        </Card>
      ) : (
        !error && <div className="text-center text-muted py-5">Please select a period to view your payslip.</div>
      )}
    </Container>
  );
};

export default EmployeePayslip;
