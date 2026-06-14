import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Form,
  Button,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { BsCalendar3, BsSearch, BsFilter, BsDownload } from "react-icons/bs";
import holidayService from "../../services/holidayService";
import branchService from "../../services/branchService";

// Safe icon renderer
const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface EmployeeHoliday {
  id: number;
  name: string;
  date: string;
  type: "Normal" | "Optional" | "Special" | "Company" | "Weekend";
  branchID: number;
}

interface BranchOption {
  value: number;
  label: string;
}

const HolidayList: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [search, setSearch] = useState<string>("");
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number>(0);

  // Filter modal states
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");

  // Holidays fetched from API
  const [holidays, setHolidays] = useState<EmployeeHoliday[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Example organization ID (replace with dynamic ID if needed)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizationID = user?.organizationID ?? 0;

  // Fetch branches once
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await branchService.getBranchesAsync(organizationID);
        const list = data?.Table ?? data ?? [];
        const options = list.map((b: any) => ({
          value: Number(b.BranchID ?? b.branchID ?? b.id ?? 0),
          label: b.BranchName || b.branchName || b.name || "Unknown Branch",
        }));
        setBranches(options);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    if (organizationID) {
      fetchBranches();
    }
  }, [organizationID]);

  // Fetch holidays whenever organizationID or selectedYear changes
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const data = await holidayService.getOrgholidays(organizationID);

        // Map API response to EmployeeHoliday format
        const mappedHolidays: EmployeeHoliday[] = data
          .filter((h: any) => new Date(h.HolidayDate).getFullYear() === selectedYear)
          .map((h: any) => ({
            id: Number(h.HolidayID ?? h.holidayID ?? h.id ?? 0),
            name: h.HolidayName || h.holidayName || "",
            date: (h.HolidayDate || h.holidayDate || "").split("T")[0], // Keep only yyyy-mm-dd
            type: h.IsOptional ? "Optional" : "Company",
            branchID: Number(h.BranchID ?? h.branchID ?? h.BranchId ?? 0),
          }));

        setHolidays(mappedHolidays);
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationID) {
      fetchHolidays();
    }
  }, [organizationID, selectedYear]);

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
      (selectedBranch ? h.branchID === selectedBranch : true) &&
      (filterType ? h.type === filterType : true) &&
      (filterMonth ? month === Number(filterMonth) : true) &&
      h.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="Container">
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
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>{Icon(BsSearch)}</InputGroup.Text>
            <Form.Control
              placeholder="Search holiday..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>

          <Col md={4}>
          <Form.Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
          >
            <option value={0}>All Branches</option>
            {branches.map((branch) => (
              <option key={branch.value} value={branch.value}>
                {branch.label}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={4} className="text-end">
          <Button variant="outline-secondary" onClick={() => setShowFilter(true)}>
            {Icon(BsFilter, { className: "me-2" })}
            Filter
          </Button>
        </Col>
      </Row>

      {/* Holiday List */}
      {loading ? (
        <div className="text-center text-muted mt-5">Loading holidays...</div>
      ) : filteredHolidays.length > 0 ? (
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
      ) : (
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