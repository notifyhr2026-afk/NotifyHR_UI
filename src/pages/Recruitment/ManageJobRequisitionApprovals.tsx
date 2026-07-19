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

  organizationID: number;
  branchID: number;
  positionID: number;
  departmentID: number;
  employmentTypeID: number;

  noOfOpenings: number;
  requestedBy: number;
  requestedUser: string;
  requestedDate: string;
  targetStartDate: string;

  jobDescription: string;

  minExperienceYears: number;
  maxExperienceYears: number;

  minSalary: number;
  maxSalary: number;

  jobStatus: string;

  branch: string;
  position: string;
  department: string;
  employmentType: string;

  approverID: number;
  approvalOrder: number;
  status: "Open" | "Pending" | "Approved" | "Rejected";
  comments: string;
  actionDate?: string;
  approvalGroupID: number;

  canApprove: number;
  isApproved: number;
  isRejected: number;
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
  approvalID: x.ApprovalID,
  jobRequisitionID: x.JobRequisitionID,
  jobRequisitionNo: x.JobRequisitionNo,

  organizationID: x.OrganizationID,
  branchID: x.BranchID,
  positionID: x.PositionID,
  departmentID: x.DepartmentID,
  employmentTypeID: x.EmploymentTypeID,

  noOfOpenings: x.NoOfOpenings,
  requestedBy: x.RequestedBy,
  requestedUser: x.RequestedUser,
  requestedDate: x.RequestedDate,
  targetStartDate: x.TargetStartDate,

  jobDescription: x.JobDescription,

  minExperienceYears: x.MinExperienceYears,
  maxExperienceYears: x.MaxExperienceYears,

  minSalary: x.MinSalary,
  maxSalary: x.MaxSalary,

  jobStatus: x.JobStatus,

  branch: x.Branch,
  position: x.Position,
  department: x.Department,
  employmentType: x.EmploymentType,

  approverID: x.ApproverID,
  approvalOrder: x.ApprovalOrder,
  status: x.ApprovalStatus,
  comments: x.Comments,
  actionDate: x.ActionDate,
  approvalGroupID: x.ApprovalGroupID,

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
              <th>Position</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Action</th>
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
                  <td>{item.position}</td>
                  <td>{item.requestedUser}</td>
                  <td>{item.status}</td>

                  <td>
                    <Button
                      size="sm"
                      onClick={() => openModal(item)}
                    >
                      View Details
                    </Button>
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
  {selected && (
    <>
      {/* Job Details */}
      <div className="border rounded p-3 mb-3 bg-light">
        <div className="row">
          <div className="col-md-6 mb-2">
            <strong>Requisition No:</strong> {selected.jobRequisitionNo}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Position:</strong> {selected.position}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Department:</strong> {selected.department}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Branch:</strong> {selected.branch}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Employment Type:</strong> {selected.employmentType}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Openings:</strong> {selected.noOfOpenings}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Requested By:</strong> {selected.requestedUser}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Requested Date:</strong>{" "}
            {new Date(selected.requestedDate).toLocaleDateString()}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Target Start Date:</strong>{" "}
            {new Date(selected.targetStartDate).toLocaleDateString()}
          </div>

          <div className="col-md-6 mb-2">
            <strong>Experience:</strong>{" "}
            {selected.minExperienceYears} - {selected.maxExperienceYears} Years
          </div>

          <div className="col-md-6 mb-2">
            <strong>Salary:</strong> ₹{selected.minSalary} - ₹{selected.maxSalary}
          </div>

          <div className="col-12">
            <strong>Job Description</strong>
            <div className="border rounded p-2 mt-1">
              {selected.jobDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Approval Form */}
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
              <option key={status} value={status}>
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