import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import jobRequisitionService from "../../services/jobRequisitionService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Approval {
  approvalID: number;
  jobRequisitionID: number;
  jobRequisitionNo: string;
  jobTitle: string;
  approverID: number;
  approverName: string;
  approvalOrder: number;
  status: "Pending" | "Approved" | "Rejected";
  comments: string;
  actionDate?: string;
  approvalGroupID: number;
  jobDescription: string;
}

const statusOptions = ["Approved", "Rejected"];

const ManageJobRequisitionApprovals: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const organizationID: number = user?.organizationID;
  const employeeID: number = user?.employeeID;
  const employeeName: string = user?.fullName;

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [selected, setSelected] = useState<Approval | null>(null);

  const [formData, setFormData] = useState({
    status: "Approved",
    comments: "",
  });

  useEffect(() => {
    if (organizationID && employeeID) {
      loadApprovals();
    }
  }, []);

const loadApprovals = async () => {
  try {
    setLoading(true);

    const response = await jobRequisitionService.GetMyApprovalsAsync(
      organizationID,
      employeeID
    );

    const data = response.map((x: any) => ({
      approvalID: x.ApprovalID ? x.ApprovalID : 0,
      jobRequisitionID: x.JobRequisitionID,
      jobRequisitionNo: x.JobRequisitionNo,
      jobTitle: x.PositionName ?? "",       // if your API returns PositionName
      jobDescription: x.JobDescription ?? "",
      approverID: x.ApproverID,
      approverName: x.ApproverName ?? "",
      approvalOrder: x.ApprovalOrder ?? 0,
      status: x.ApprovalStatus ?? "Pending",
      comments: x.Comments ?? "",
      actionDate: x.ActionDate,
      approvalGroupID: x.ApprovalGroupID ?? 0,
      canApprove: x.CanApprove,
      isApproved: x.IsApproved,
      isRejected: x.IsRejected,
    }));

    setApprovals(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const openModal = (item: Approval) => {
    setSelected(item);

    setFormData({
      status: "Approved",
      comments: "",
    });

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selected) return;

    try {
      const payload = {
        approvalID: selected.approvalID ? selected.approvalID : 0,
        jobRequisitionID: selected.jobRequisitionID,
        approverID: employeeID,
        approvalOrder: selected.approvalOrder ?? 0,
        status: formData.status,
        comments: formData.comments,
        actionDate: new Date().toISOString(),
        approvalGroupID: selected.approvalGroupID ?? 0,
      };

      await jobRequisitionService.PostManageJobApprovalAsync(payload);

      toast.success(`Request ${formData.status}`);

      setShowModal(false);

      loadApprovals();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save approval.");
    }
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <h3>My Job Approvals</h3>

        <div>
          <strong>{employeeName}</strong>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Req No</th>
              <th>Job Description</th>
              <th>Approver</th>
              <th>Order</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Action Date</th>
              <th style={{ width: 120 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {approvals.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              approvals.map((item) => (
                <tr key={item.approvalID}>
                  <td>{item.jobRequisitionNo}</td>

                  <td>{item.jobDescription}</td>

                  <td>{item.approverName}</td>

                  <td>{item.approvalOrder}</td>

                  <td>
                    {item.status === "Approved" && (
                      <Badge bg="success">Approved</Badge>
                    )}

                    {item.status === "Rejected" && (
                      <Badge bg="danger">Rejected</Badge>
                    )}

                    {item.status === "Pending" && (
                      <Badge bg="warning">Pending</Badge>
                    )}
                  </td>

                  <td>{item.comments || "-"}</td>

                  <td>
                    {item.actionDate
                      ? new Date(item.actionDate).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {item.status === "Pending" ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openModal(item)}
                      >
                        Take Action
                      </Button>
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
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Approval Action</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>

              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Comments</Form.Label>

              <Form.Control
                as="textarea"
                rows={4}
                value={formData.comments}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    comments: e.target.value,
                  })
                }
                placeholder="Enter comments..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            onClick={handleSave}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageJobRequisitionApprovals;