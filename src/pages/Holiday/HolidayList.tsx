import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Dropdown,
  Form,
  Button,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  BsCalendar3,
  BsSearch,
  BsFilter,
  BsDownload,
} from "react-icons/bs";

// Safe icon renderer to avoid JSX issues
const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface EmployeeHoliday {
  id: number;
  name: string;
  date: string;
  type: "Normal" | "Optional" | "Special" | "Company" | "Weekend";
}

const HolidayList: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [search, setSearch] = useState<string>("");

  // Filter modal states
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");

  // Sample data (replace with API later)
  const holidays: EmployeeHoliday[] = [
    { id: 1, name: "New Year’s Day", date: "2025-01-01", type: "Company" },
    { id: 2, name: "Pongal", date: "2025-01-15", type: "Normal" },
    { id: 3, name: "Republic Day", date: "2025-01-26", type: "Company" },
    { id: 4, name: "Good Friday", date: "2025-03-29", type: "Special" },
    { id: 5, name: "Ugadi", date: "2025-04-09", type: "Optional" },
    { id: 6, name: "May Day", date: "2025-05-01", type: "Company" },
  ];

  const badgeColor = (type: string) => {
    switch (type) {
      case "Normal":
        return "primary";
      case "Optional":
        return "warning";
      case "Special":
        return "info";
      case "Company":
        return "success";
      case "Weekend":
        return "secondary";
      default:
        return "dark";
    }
  };

  // Filtering logic
  const filteredHolidays = holidays.filter((h) => {
    const month = new Date(h.date).getMonth() + 1;

    return (
      (filterType ? h.type === filterType : true) &&
      (filterMonth ? month === Number(filterMonth) : true) &&
      h.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-3 mt-5">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Employee Holiday Calendar</h3>        
        </div>

        {/* Year + Export */}
        <div className="d-flex gap-2">
          <Form.Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ width: "120px" }}
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Form.Select>

          <Button variant="outline-primary">
            {Icon(BsDownload, { className: "me-2" })}
            Export
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>{Icon(BsSearch)}</InputGroup.Text>
            <Form.Control
              placeholder="Search holiday..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={6} className="text-end">
          <Button variant="outline-secondary" onClick={() => setShowFilter(true)}>
            {Icon(BsFilter, { className: "me-2" })}
            Filter
          </Button>
        </Col>
      </Row>

      {/* Holiday List */}
      <Row>
        {filteredHolidays.map((h) => (
          <Col md={6} key={h.id} className="mb-3">
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">{h.name}</h5>
                  <div className="text-muted">
                    {new Date(h.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <Badge bg={badgeColor(h.type)}>{h.type}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* No Results */}
      {filteredHolidays.length === 0 && (
        <div className="text-center text-muted mt-5">
          {Icon(BsCalendar3, { size: 40, className: "mb-3" })}
          <p>No holidays found</p>
        </div>
      )}

      {/* Filter Modal */}
      <Modal show={showFilter} onHide={() => setShowFilter(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter Holidays</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Holiday Type */}
            <Form.Group className="mb-3">
              <Form.Label>Holiday Type</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Normal">Normal</option>
                <option value="Optional">Optional</option>
                <option value="Special">Special</option>
                <option value="Company">Company Holiday</option>
                <option value="Weekend">Weekend</option>
              </Form.Select>
            </Form.Group>

            {/* Month Filter */}
            <Form.Group className="mb-3">
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setFilterType("");
              setFilterMonth("");
              setShowFilter(false);
            }}
          >
            Reset
          </Button>

          <Button variant="primary" onClick={() => setShowFilter(false)}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HolidayList;
