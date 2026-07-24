import React, { useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Table,
  Button,
  Form,
  Badge
} from "react-bootstrap";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  totalDays: number;
  present: number;
  absent: number;
  leave: number;
  lop: number;
  overtimeHours: number;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = [
  2026,
  2025,
  2024,
  2023
];

const attendanceData: AttendanceRecord[] = [
  {
    employeeId: "EMP001",
    employeeName: "John Smith",
    department: "IT",
    totalDays: 30,
    present: 28,
    absent: 1,
    leave: 1,
    lop: 0,
    overtimeHours: 12,
  },
  {
    employeeId: "EMP002",
    employeeName: "Rahul Kumar",
    department: "HR",
    totalDays: 30,
    present: 27,
    absent: 2,
    leave: 1,
    lop: 0,
    overtimeHours: 6,
  },
  {
    employeeId: "EMP003",
    employeeName: "Priya Sharma",
    department: "Finance",
    totalDays: 30,
    present: 25,
    absent: 3,
    leave: 2,
    lop: 0,
    overtimeHours: 9,
  },
];
const AttendanceRegisterReport: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [department, setDepartment] = useState("All");

  const departments = [
    "All",
    "IT",
    "HR",
    "Finance"
  ];

  // Static data for now (replace with API later)
  const records = attendanceData.filter((x) =>
    department === "All"
      ? true
      : x.department === department
  );

  const totalEmployees = records.length;

  const totalPresent = records.reduce(
    (sum, x) => sum + x.present,
    0
  );

  const totalAbsent = records.reduce(
    (sum, x) => sum + x.absent,
    0
  );

  const totalLeave = records.reduce(
    (sum, x) => sum + x.leave,
    0
  );

  const totalLOP = records.reduce(
    (sum, x) => sum + x.lop,
    0
  );
const downloadPDF = () => {

  const doc = new jsPDF("landscape");

  doc.setFontSize(18);
  doc.setTextColor(40);

  doc.text(
    "Attendance Register Report",
    14,
    18
  );

  doc.setFontSize(10);

  doc.text(
    `Month : ${
      MONTHS.find(m => m.value === selectedMonth)?.label
    }`,
    14,
    28
  );

  doc.text(
    `Year : ${selectedYear}`,
    90,
    28
  );

  doc.text(
    `Department : ${department}`,
    150,
    28
  );

  autoTable(doc, {
    startY: 38,

    head: [[
      "Emp ID",
      "Employee Name",
      "Department",
      "Total Days",
      "Present",
      "Absent",
      "Leave",
      "LOP",
      "OT Hours"
    ]],

    body: records.map(r => [

      r.employeeId,

      r.employeeName,

      r.department,

      r.totalDays,

      r.present,

      r.absent,

      r.leave,

      r.lop,

      r.overtimeHours

    ]),

    theme: "grid",

    headStyles: {

      fillColor: [13,110,253],

      textColor: 255

    },

    styles: {

      fontSize: 9

    }

  });

  doc.save("AttendanceRegister.pdf");

};

  return (
    <Container fluid className="mt-4">

      <Card className="shadow-sm">

        <Card.Header>

          <h4 className="mb-0">
            Attendance Register Report
          </h4>

        </Card.Header>

        <Card.Body>

          <Row className="mb-4">

            <Col md={3}>

              <Form.Group>

                <Form.Label>
                  Month
                </Form.Label>

                <Form.Select
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(Number(e.target.value))
                  }
                >

                  {MONTHS.map((m) => (

                    <option
                      key={m.value}
                      value={m.value}
                    >
                      {m.label}
                    </option>

                  ))}

                </Form.Select>

              </Form.Group>

            </Col>

            <Col md={3}>

              <Form.Group>

                <Form.Label>
                  Year
                </Form.Label>

                <Form.Select
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(Number(e.target.value))
                  }
                >

                  {YEARS.map((y) => (

                    <option key={y}>
                      {y}
                    </option>

                  ))}

                </Form.Select>

              </Form.Group>

            </Col>

            <Col md={3}>

              <Form.Group>

                <Form.Label>
                  Department
                </Form.Label>

                <Form.Select
                  value={department}
                  onChange={(e) =>
                    setDepartment(e.target.value)
                  }
                >

                  {departments.map((d) => (

                    <option key={d}>
                      {d}
                    </option>

                  ))}

                </Form.Select>

              </Form.Group>

            </Col>

            <Col
              md={3}
              className="d-flex align-items-end"
            >

              <Button
                variant="primary"
                className="w-100"
              >
                View Report
              </Button>

            </Col>

          </Row>

          <Row className="mb-4">

            <Col md={3}>

              <Card
                bg="primary"
                text="white"
              >
                <Card.Body>

                  <h6>Total Employees</h6>

                  <h3>{totalEmployees}</h3>

                </Card.Body>

              </Card>

            </Col>

            <Col md={2}>

              <Card
                bg="success"
                text="white"
              >
                <Card.Body>

                  <h6>Present</h6>

                  <h3>{totalPresent}</h3>

                </Card.Body>

              </Card>

            </Col>

            <Col md={2}>

              <Card
                bg="danger"
                text="white"
              >
                <Card.Body>

                  <h6>Absent</h6>

                  <h3>{totalAbsent}</h3>

                </Card.Body>

              </Card>

            </Col>

            <Col md={2}>

              <Card
                bg="warning"
                text="dark"
              >
                <Card.Body>

                  <h6>Leave</h6>

                  <h3>{totalLeave}</h3>

                </Card.Body>

              </Card>

            </Col>

            <Col md={3}>

              <Card
                bg="secondary"
                text="white"
              >
                <Card.Body>

                  <h6>LOP</h6>

                  <h3>{totalLOP}</h3>

                </Card.Body>

              </Card>

            </Col>

          </Row>
          <div className="d-flex justify-content-end mb-3">

            <Button
              variant="success"
              className="me-2"
              onClick={downloadPDF}
            >
              Download PDF
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.print()}
            >
              Print
            </Button>

          </div>

          <Table
            striped
            bordered
            hover
            responsive
          >

            <thead className="table-dark">

              <tr>

                <th>Employee ID</th>

                <th>Employee Name</th>

                <th>Department</th>

                <th>Total Days</th>

                <th>Present</th>

                <th>Absent</th>

                <th>Leave</th>

                <th>LOP</th>

                <th>OT (Hours)</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {records.map((row) => (

                <tr key={row.employeeId}>

                  <td>{row.employeeId}</td>

                  <td>{row.employeeName}</td>

                  <td>{row.department}</td>

                  <td>{row.totalDays}</td>

                  <td>{row.present}</td>

                  <td>{row.absent}</td>

                  <td>{row.leave}</td>

                  <td>{row.lop}</td>

                  <td>{row.overtimeHours}</td>

                  <td>

                    <Badge
                      bg={
                        row.absent === 0
                          ? "success"
                          : row.absent <= 2
                          ? "warning"
                          : "danger"
                      }
                    >

                      {row.absent === 0
                        ? "Excellent"
                        : row.absent <= 2
                        ? "Good"
                        : "Poor"}

                    </Badge>

                  </td>

                </tr>

              ))}

            </tbody>

          </Table>

        </Card.Body>

      </Card>

    </Container>

  );

};
export default AttendanceRegisterReport;