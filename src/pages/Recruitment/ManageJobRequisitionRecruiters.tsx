import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jobRequisitionService from "../../services/jobRequisitionService";

// ========================= Interfaces =========================

interface JobRecruiter {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  RecruiterUserID: number;
  AssignedDate?: string;
  RevokedDate?: string;
  Status: string;
}

interface JobRequisition {
  JobRequisitionID: number;
  JobRequisitionNo: string;
}

interface Recruiter {
  id: number;
  name: string;
}

// ========================= Static Recruiters =========================
// Replace with Employee/GetRecruiters API later

const recruiters: Recruiter[] = [
  {
    id: 1,
    name: "Recruiter 1",
  },
  {
    id: 2,
    name: "Recruiter 2",
  },
  {
    id: 3,
    name: "Recruiter 3",
  },
];

const statuses = [
  "Assign",
  "Revoked",
];

const ManageJobRequisitionRecruiters: React.FC = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const organizationID = user?.organizationID;
  const employeeID = user?.employeeID;
  const employeeName = user?.fullName;

  const [loading, setLoading] = useState(false);

  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([]);

  const [recruitersList, setRecruitersList] = useState<JobRecruiter[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [validated, setValidated] = useState(false);

  const [editRecruiter, setEditRecruiter] =
    useState<JobRecruiter | null>(null);

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const [recruiterToDelete, setRecruiterToDelete] =
    useState<number | null>(null);

  const [formData, setFormData] =
    useState<JobRecruiter>({
      JobReqRecruiterID: 0,
      JobRequisitionID: 0,
      RecruiterUserID: 0,
      AssignedDate: "",
      RevokedDate: "",
      Status: "Assign",
    });

  useEffect(() => {

    if (organizationID) {
      loadJobRequisitions();
    }

    if (employeeID) {
      loadAssignedJobs();
    }

  }, []);

  // ========================= Load Job Requisitions =========================

  const loadJobRequisitions = async () => {

    try {

      const response =
        await jobRequisitionService.GetJobForAssignmentByOrganizationAsync(
          organizationID
        );

      setJobRequisitions(response || []);

    } catch (error) {

      console.log(error);

      toast.error("Failed to load Job Requisitions.");

    }

  };

  // ========================= Load Assigned Jobs =========================

  const loadAssignedJobs = async () => {

    try {

      setLoading(true);

      const response =
        await jobRequisitionService.GetRecruiterAssignedJobsAsync(
          employeeID
        );

      setRecruitersList(response || []);

    } catch (error) {

      console.log(error);

      toast.error("Failed to load assigned jobs.");

    } finally {

      setLoading(false);

    }

  };

  // ========================= Handle Change =========================

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {

    const { id, value } = e.target;

    setFormData((prev) => ({

      ...prev,

      [id]:
        id === "JobRequisitionID" ||
        id === "RecruiterUserID"
          ? Number(value)
          : value,

    }));

  };

  // ========================= Add =========================

  const openAddModal = () => {

    setEditRecruiter(null);

    setValidated(false);

    setFormData({

      JobReqRecruiterID: 0,

      JobRequisitionID: 0,

      RecruiterUserID: 0,

      AssignedDate: "",

      RevokedDate: "",

      Status: "Assign",

    });

    setShowModal(true);

  };

  // ========================= Edit =========================

  const openEditModal = (
    recruiter: JobRecruiter
  ) => {

    setEditRecruiter(recruiter);

    setValidated(false);

    setFormData(recruiter);

    setShowModal(true);

  };
    // ========================= Save =========================

  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    const form = event.currentTarget;

    if (form.checkValidity() === false) {

      event.stopPropagation();

      setValidated(true);

      toast.warning("Please fill all required fields.");

      return;

    }

    try {

      const payload = {

        jobReqRecruiterID: formData.JobReqRecruiterID,

        jobRequisitionID: formData.JobRequisitionID,

        recruiterUserID: formData.RecruiterUserID,

        status: formData.Status,

        createdBy: employeeName,

      };

      await jobRequisitionService.PostManageJobRequisitionRecruiterAsync(
        payload
      );

      toast.success(
        editRecruiter
          ? "Recruiter updated successfully."
          : "Recruiter assigned successfully."
      );

      setShowModal(false);

      setValidated(false);

      await loadAssignedJobs();

    } catch (error) {

      console.error(error);

      toast.error("Unable to save recruiter assignment.");

    }

  };

  // ========================= Delete =========================

  const confirmDeleteRecruiter = (id: number) => {

    setRecruiterToDelete(id);

    setConfirmDelete(true);

  };

  const handleDelete = async () => {

    try {

      /**
       * If your API later provides
       * DeleteJobRequisitionRecruiterAsync(id)
       * call it here.
       */

      setRecruitersList((prev) =>
        prev.filter(
          (x) => x.JobReqRecruiterID !== recruiterToDelete
        )
      );

      toast.success("Recruiter assignment removed.");

      setConfirmDelete(false);

      setRecruiterToDelete(null);

    } catch (error) {

      console.error(error);

      toast.error("Unable to delete assignment.");

    }

  };

  // ========================= Helpers =========================

  const getJobName = (id: number) => {

    return (
      jobRequisitions.find(
        (x) => x.JobRequisitionID === id
      )?.JobRequisitionNo ?? "-"
    );

  };

  const getRecruiterName = (id: number) => {

    return (
      recruiters.find(
        (x) => x.id === id
      )?.name ?? "-"
    );

  };

  const badgeClass = (status: string) => {

    switch (status) {

      case "Assign":
        return "bg-success";

      case "Revoked":
        return "bg-danger";

      default:
        return "bg-secondary";

    }

  };

  // ========================= Render =========================

  return (

    <div className="container mt-3">

      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3>Manage Job Requisition Recruiters</h3>

        <Button
          variant="success"
          onClick={openAddModal}
        >
          + Add Recruiter
        </Button>

      </div>
            {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table
          bordered
          hover
          responsive
          className="align-middle"
        >
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Job Requisition</th>
              <th>Recruiter</th>
              <th>Assigned Date</th>
              <th>Revoked Date</th>
              <th>Status</th>
              <th style={{ width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {recruitersList.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center"
                >
                  No Records Found.
                </td>
              </tr>
            ) : (
              recruitersList.map((item) => (
                <tr key={item.JobReqRecruiterID}>
                  <td>{item.JobReqRecruiterID}</td>

                  <td>
                    {getJobName(
                      item.JobRequisitionID
                    )}
                  </td>

                  <td>
                    {getRecruiterName(
                      item.RecruiterUserID
                    )}
                  </td>

                  <td>
                    {item.AssignedDate
                      ? new Date(
                          item.AssignedDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    {item.RevokedDate
                      ? new Date(
                          item.RevokedDate
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <span
                      className={`badge ${badgeClass(
                        item.Status
                      )}`}
                    >
                      {item.Status}
                    </span>
                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() =>
                        openEditModal(item)
                      }
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        confirmDeleteRecruiter(
                          item.JobReqRecruiterID
                        )
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
            {/* ================= ADD / EDIT MODAL ================= */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            {editRecruiter
              ? "Edit Recruiter Assignment"
              : "Assign Recruiter"}
          </Modal.Title>

        </Modal.Header>


        <Modal.Body>

          <Form
            noValidate
            validated={validated}
            onSubmit={handleSave}
          >

            <Row className="mb-3">

              <Col md={12}>

                <Form.Group controlId="JobRequisitionID">

                  <Form.Label>
                    Job Requisition
                  </Form.Label>


                  <Form.Select
                    required
                    value={
                      formData.JobRequisitionID
                    }
                    onChange={handleInputChange}
                  >

                    <option value="">
                      Select Job Requisition
                    </option>


                    {jobRequisitions.map(
                      (job) => (
                        <option
                          key={
                            job.JobRequisitionID
                          }
                          value={
                            job.JobRequisitionID
                          }
                        >
                          {
                            job.JobRequisitionNo
                          }
                        </option>
                      )
                    )}

                  </Form.Select>


                  <Form.Control.Feedback type="invalid">
                    Please select job requisition.
                  </Form.Control.Feedback>


                </Form.Group>

              </Col>

            </Row>



            <Row className="mb-3">

              <Col md={12}>

                <Form.Group controlId="RecruiterUserID">

                  <Form.Label>
                    Recruiter
                  </Form.Label>


                  <Form.Select
                    required
                    value={
                      formData.RecruiterUserID
                    }
                    onChange={handleInputChange}
                  >

                    <option value="">
                      Select Recruiter
                    </option>


                    {recruiters.map(
                      (rec) => (
                        <option
                          key={rec.id}
                          value={rec.id}
                        >
                          {rec.name}
                        </option>
                      )
                    )}

                  </Form.Select>


                  <Form.Control.Feedback type="invalid">
                    Please select recruiter.
                  </Form.Control.Feedback>


                </Form.Group>

              </Col>

            </Row>



            <Row className="mb-3">

              <Col md={12}>

                <Form.Group controlId="Status">

                  <Form.Label>
                    Status
                  </Form.Label>


                  <Form.Select
                    value={
                      formData.Status
                    }
                    onChange={handleInputChange}
                  >

                    {statuses.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}

                  </Form.Select>


                </Form.Group>

              </Col>

            </Row>



            <Modal.Footer>

              <Button
                variant="secondary"
                onClick={() =>
                  setShowModal(false)
                }
              >
                Cancel
              </Button>


              <Button
                variant="primary"
                type="submit"
              >

                {editRecruiter
                  ? "Update"
                  : "Save"}

              </Button>


            </Modal.Footer>


          </Form>


        </Modal.Body>


      </Modal>



      {/* ================= DELETE CONFIRMATION ================= */}

      <Modal
        show={confirmDelete}
        onHide={() =>
          setConfirmDelete(false)
        }
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Confirm Delete
          </Modal.Title>

        </Modal.Header>


        <Modal.Body>

          Are you sure you want to remove this
          recruiter assignment?

        </Modal.Body>


        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={() =>
              setConfirmDelete(false)
            }
          >
            Cancel
          </Button>


          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>


        </Modal.Footer>


      </Modal>



      <ToastContainer
        position="top-right"
        autoClose={3000}
      />


    </div>

  );

};


export default ManageJobRequisitionRecruiters;