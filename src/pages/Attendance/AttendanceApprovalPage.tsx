import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import employeeAttendanceService from "../../services/employeeAttendanceService";

interface AttendanceRequest {
  CorrectionID: number;
  RequestedBy: number;
  RequestedAt: string;
  NewCheckInTime: string;
  NewCheckOutTime: string;
  Reason: string;
  StatusID: number;
  CorrectionTypeName: string;
  StatusName: string;
  Remarks: string;
}

const displayVal = (val: any) =>
  val === null || val === undefined || val === "" ? "-" : val;

const AttendanceApprovalPage: React.FC = () => {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AttendanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadRequests = async () => {
    setLoading(true);
    try {
      const payload = {
        organizationID: user?.organizationID,
        statusID: statusFilter,
        employeeIDs: "",
      };
      const res = await employeeAttendanceService.getAttendanceCorrectionRequests(payload);
      const data = Array.isArray(res) ? res : [];
      setRequests(data);
      setFilteredRequests(data);
    } catch (err: any) {
      toast.error("Failed to fetch attendance correction requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.organizationID) {
      loadRequests();
    }
  }, [statusFilter]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const filtered = requests.filter(
      (x) =>
        (x.RequestedBy?.toString() || "").toLowerCase().includes(lower) ||
        (x.CorrectionTypeName || "").toLowerCase().includes(lower) ||
        (x.StatusName || "").toLowerCase().includes(lower)
    );
    setFilteredRequests(filtered);
  }, [search, requests]);

  const handleApprove = async (req: AttendanceRequest) => {
    try {
      const payload = {
        correctionID: req.CorrectionID,
        remarks: "",
        statusID: 2,
        createdBy: user?.userID || 0,
      };
      const res = await employeeAttendanceService.approveRejectAttendanceCorrection(payload);
      const result = Array.isArray(res) ? res[0] : res;
      if (result?.Success !== 1) {
        throw new Error(result?.Message || "Approval failed");
      }
      toast.success("Request approved successfully.");
      loadRequests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to approve request.";
      toast.error(msg);
    }
  };

  const openRejectModal = (req: AttendanceRequest) => {
    setSelectedRequest(req);
    setRemarks("");
    setShowModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!remarks.trim()) {
      toast.warn("Remarks are required for rejection.");
      return;
    }
    try {
      const payload = {
        correctionID: selectedRequest.CorrectionID,
        remarks: remarks.trim(),
        statusID: 3,
        createdBy: user?.userID || 0,
      };
      const res = await employeeAttendanceService.approveRejectAttendanceCorrection(payload);
      const result = Array.isArray(res) ? res[0] : res;
      if (result?.Success !== 1) {
        throw new Error(result?.Message || "Rejection failed");
      }
      toast.success("Request rejected successfully.");
      setShowModal(false);
      loadRequests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to reject request.";
      toast.error(msg);
    }
  };

  const renderStatus = (statusID: number) => {
    const base = "d-inline-flex align-items-center gap-1 px-3 py-1 rounded-3 fw-semibold";
    switch (statusID) {
      case 2:
        return <span className={`${base} bg-success bg-opacity-10 text-success`}>Approved</span>;
      case 3:
        return <span className={`${base} bg-danger bg-opacity-10 text-danger`}>Rejected</span>;
      default:
        return <span className={`${base} bg-warning bg-opacity-10 text-warning-emphasis`}>Pending</span>;
    }
  };

  const counts = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((x) => x.StatusID === 1).length,
      approved: requests.filter((x) => x.StatusID === 2).length,
      rejected: requests.filter((x) => x.StatusID === 3).length,
    };
  }, [requests]);

  const formatToTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "-";
    }
  };

  const formatToDate = (dateStr: string) => {
    try {
      return dateStr.split("T")[0];
    } catch {
      return "-";
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">
          Attendance Request Approval
        </h3>
        <div className="d-flex gap-2">
          <Form.Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(Number(e.target.value))}
          >
            <option value={0}>All</option>
            <option value={1}>Pending</option>
            <option value={2}>Approved</option>
            <option value={3}>Rejected</option>
          </Form.Select>
          <Form.Control
            placeholder="Search..."
            style={{ width: 260 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
       <Table
                   hover
                   responsive
                   className="mb-0"
                   style={{
                     verticalAlign: "middle",
                   }}
                 >
         <thead
              style={{
                background: "rgba(0,0,0,.03)",
              }}
            >
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
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.CorrectionID}>
                  <td>{displayVal(req.CorrectionID)}</td>
                  <td>{displayVal(req.RequestedBy)}</td>
                  <td>{displayVal(req.CorrectionTypeName)}</td>
                  <td>{displayVal(formatToDate(req.RequestedAt))}</td>
                  <td>{displayVal(formatToTime(req.NewCheckInTime))}</td>
                  <td>{displayVal(formatToTime(req.NewCheckOutTime))}</td>
                  <td>{displayVal(req.Reason)}</td>
                  <td>{renderStatus(req.StatusID)}</td>
                  <td>
                    {req.StatusID === 1 ? (
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(req)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => openRejectModal(req)}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {req.StatusID === 3 ? displayVal(req.Remarks) : "Approved"}
                          </Tooltip>
                        }
                      >
                        {req.StatusID === 2 ? (
                          <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-3 bg-success bg-opacity-10 text-success fw-semibold">
                            <span>✓</span>
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-3 bg-danger bg-opacity-10 text-danger fw-semibold">
                            <span>✗</span>
                            <span>Completed</span>
                          </span>
                        )}
                      </OverlayTrigger>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Reject Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <strong>Employee:</strong>{" "}
                {selectedRequest.RequestedBy}
              </div>
              <div className="mb-3">
                <strong>Request Type:</strong>{" "}
                {selectedRequest.CorrectionTypeName}
              </div>
              <div className="mb-3">
                <strong>Date:</strong>{" "}
                {formatToDate(selectedRequest.RequestedAt)}
              </div>
              <Form.Group>
                <Form.Label>
                  Remarks <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter rejection reason..."
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
            variant="danger"
            onClick={handleReject}
          >
            Confirm Reject
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AttendanceApprovalPage;
