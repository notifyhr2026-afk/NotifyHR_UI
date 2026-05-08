import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface AttendanceRequest {
  requestID: number;
  employeeName: string;
  employeeID: number;
  requestType: string;
  requestDate: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
}

const AttendanceApprovalPage: React.FC = () => {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);

  const [filteredRequests, setFilteredRequests] = useState<
    AttendanceRequest[]
  >([]);

  const [selectedRequest, setSelectedRequest] =
    useState<AttendanceRequest | null>(null);

  const [showModal, setShowModal] = useState(false);

const [actionType, setActionType] = useState<
  "Approved" | "Rejected"
>("Approved");

  const [remarks, setRemarks] = useState("");

  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ---------------- MOCK API ----------------

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // 🔥 Replace with API

      const mockData: AttendanceRequest[] = [
        {
          requestID: 1001,
          employeeName: "John Doe",
          employeeID: 101,
          requestType: "WFH",
          requestDate: "2026-05-07",
          startTime: "09:00",
          endTime: "18:00",
          reason: "Internet issue",
          status: "Pending",
        },
        {
          requestID: 1002,
          employeeName: "Ravi Kumar",
          employeeID: 102,
          requestType: "CORRECTION",
          requestDate: "2026-05-06",
          startTime: "10:00",
          endTime: "19:00",
          reason: "Missed punch",
          status: "Pending",
        },
        {
          requestID: 1003,
          employeeName: "Priya",
          employeeID: 103,
          requestType: "WFONSITE",
          requestDate: "2026-05-04",
          startTime: "08:30",
          endTime: "17:30",
          reason: "Client Visit",
          status: "Approved",
        },
      ];

      setRequests(mockData);
      setFilteredRequests(mockData);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- SEARCH ----------------

  useEffect(() => {
    const lower = search.toLowerCase();

    const filtered = requests.filter(
      (x) =>
        x.employeeName.toLowerCase().includes(lower) ||
        x.requestType.toLowerCase().includes(lower) ||
        x.status.toLowerCase().includes(lower)
    );

    setFilteredRequests(filtered);
  }, [search, requests]);

  // ---------------- OPEN MODAL ----------------

  const openModal = (
    request: AttendanceRequest,
    action: "Approved" | "Rejected"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setRemarks("");
    setShowModal(true);
  };

  // ---------------- SAVE ----------------

  const handleSubmit = async () => {
    try {
      if (!selectedRequest) return;

      // 🔥 API PAYLOAD
      const payload = {
        requestID: selectedRequest.requestID,
        employeeID: selectedRequest.employeeID,
        action: actionType,
        remarks,
        approvedBy: user?.employeeID,
      };

      console.log("APPROVAL PAYLOAD => ", payload);

      // 🔥 Replace with API call

const updated: AttendanceRequest[] = requests.map((req) =>
  req.requestID === selectedRequest.requestID
    ? {
        ...req,
        status: actionType as "Approved" | "Rejected",
      }
    : req
);

      setRequests(updated);

      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- STATUS BADGE ----------------

  const renderStatus = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge bg="success">Approved</Badge>;

      case "Rejected":
        return <Badge bg="danger">Rejected</Badge>;

      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  // ---------------- COUNTS ----------------

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((x) => x.status === "Pending")
        .length,
      approved: requests.filter((x) => x.status === "Approved")
        .length,
      rejected: requests.filter((x) => x.status === "Rejected")
        .length,
    };
  }, [requests]);

  return (
    <div className="container-fluid py-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">
          Attendance Request Approval
        </h3>

        <Form.Control
          placeholder="Search..."
          style={{ width: 260 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
  
      {/* TABLE */}
      <div className="table-responsive">
        <Table
          bordered
          hover
          className="align-middle shadow-sm"
        >
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Employee</th>
              <th>Request Type</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.requestID}>
                  <td>{req.requestID}</td>

                  <td>{req.employeeName}</td>

                  <td>{req.requestType}</td>

                  <td>{req.requestDate}</td>

                  <td>{req.startTime}</td>

                  <td>{req.endTime}</td>

                  <td>{req.reason}</td>

                  <td>{renderStatus(req.status)}</td>

                  <td>
                    {req.status === "Pending" ? (
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() =>
                            openModal(req, "Approved")
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            openModal(req, "Rejected")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted">
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* MODAL */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType} Request
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <strong>Employee:</strong>{" "}
                {selectedRequest.employeeName}
              </div>

              <div className="mb-3">
                <strong>Request Type:</strong>{" "}
                {selectedRequest.requestType}
              </div>

              <div className="mb-3">
                <strong>Date:</strong>{" "}
                {selectedRequest.requestDate}
              </div>

              <Form.Group>
                <Form.Label>Remarks</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter remarks..."
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(e.target.value)
                  }
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant={
              actionType === "Approved"
                ? "success"
                : "danger"
            }
            onClick={handleSubmit}
          >
            Confirm {actionType}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AttendanceApprovalPage;