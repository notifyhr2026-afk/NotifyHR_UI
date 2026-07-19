import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Row, Col, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import jobRequisitionService from "../../services/jobRequisitionService";

// ===== Types =====
interface RecruiterApproval {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  JobRequisitionNo: string;

  Position: string;
  Department: string;
  Branch: string;

  NoOfOpenings: number;

  RequestedUser: string;
  RequestedDate: string;
  TargetStartDate: string;

  MinExperienceYears: number;
  MaxExperienceYears: number;

  MinSalary: number;
  MaxSalary: number;

  JobStatus: string;

  Comments?: string;

  RecruiterActionStatus?: string;
}


// ===== Component =====
const RecruiterApprovalPage: React.FC = () => {

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const employeeName =
    user?.name ||
    user?.username ||
    "";
const EmployeeID = user?.employeeID || 0;
  const [approvalList, setApprovalList] = useState<RecruiterApproval[]>([]);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<RecruiterApproval | null>(null);


  const [formData, setFormData] = useState({
    status: "",
    comments: "",
  });


  const [validated, setValidated] = useState(false);



  // ============================
  // Load recruiter assigned jobs
  // ============================

  const loadRecruiterApprovals = async () => {

    try {

      setLoading(true);

      const response =
        await jobRequisitionService.GetRecruiterAssignedJobsAsync(EmployeeID);


      setApprovalList(response || []);

    }
    catch(error){

      console.error(error);

      toast.error(
        "Failed to load recruiter approvals"
      );

    }
    finally{

      setLoading(false);

    }

  };



  useEffect(() => {

    loadRecruiterApprovals();

  }, []);



  // ============================
  // Open modal
  // ============================

  const openApprovalModal = (
    item: RecruiterApproval
  ) => {

    setSelectedRequest(item);

    setFormData({

      status:
        item.RecruiterActionStatus ||
        "Pending",

      comments:
        item.Comments ||
        ""

    });


    setShowModal(true);

  };



  // ============================
  // Save approve/reject
  // ============================

  const handleSaveApproval = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {


    event.preventDefault();


    const form =
      event.currentTarget;


    if(form.checkValidity() === false){

      event.stopPropagation();

      setValidated(true);

      toast.warning(
        "Please select approval status"
      );

      return;

    }



    if(!selectedRequest){

      return;

    }



    try {


      const payload = {

        jobReqRecruiterID:
          selectedRequest.JobReqRecruiterID,


        recruiterActionStatus:
          formData.status,


        createdBy:
          employeeName

      };



      await jobRequisitionService
        .PostManageRecruiterActionAsync(payload);



      toast.success(
        `Requisition ${formData.status} successfully`
      );



      setShowModal(false);

      setValidated(false);


      loadRecruiterApprovals();


    }
    catch(error){

      console.error(error);

      toast.error(
        "Failed to update requisition status"
      );

    }

  };



  return (

    <div className="container">

      <h3 className="mb-3">
        Recruiter Approval Page
      </h3>



      <Table
        className="table table-hover table-dark-custom"
        responsive
      >

        <thead>

          <tr>

            <th>
              Req No
            </th>

            <th>
              Position
            </th>

            <th>
              Department
            </th>

            <th>
              Branch
            </th>

            <th>
              Requested By
            </th>

            <th>
              Openings
            </th>

            <th>
              Target Date
            </th>

            <th>
              Status
            </th>

            <th>
              Action
            </th>


          </tr>

        </thead>



        <tbody>


        {
          loading ?

          <tr>

            <td
              colSpan={9}
              className="text-center"
            >

              <Spinner animation="border"/>

            </td>

          </tr>


          :

          approvalList.length === 0 ?

          <tr>

            <td
              colSpan={9}
              className="text-center"
            >

              No requisitions found

            </td>

          </tr>


          :


          approvalList.map(item => (

            <tr
              key={
                item.JobReqRecruiterID
              }
            >


              <td>
                {item.JobRequisitionNo}
              </td>


              <td>
                {item.Position}
              </td>


              <td>
                {item.Department}
              </td>


              <td>
                {item.Branch}
              </td>


              <td>
                {item.RequestedUser}
              </td>


              <td>
                {item.NoOfOpenings}
              </td>


              <td>
                {
                  new Date(
                    item.TargetStartDate
                  )
                  .toLocaleDateString()
                }
              </td>


              <td>

                <span
                  className={
                    `badge ${
                      item.RecruiterActionStatus === "Approved"
                      ?
                      "bg-success"
                      :
                      item.RecruiterActionStatus === "Rejected"
                      ?
                      "bg-danger"
                      :
                      "bg-warning"
                    }`
                  }
                >

                  {
                    item.RecruiterActionStatus ||
                    "Pending"
                  }

                </span>

              </td>


              <td>

                <Button

                  size="sm"

                  variant="outline-primary"

                  onClick={() =>
                    openApprovalModal(item)
                  }

                >

                  Approve / Reject

                </Button>


              </td>


            </tr>


          ))

        }


        </tbody>


      </Table>





      {/* Approval Modal */}

      <Modal

        show={showModal}

        onHide={() =>
          setShowModal(false)
        }

      >

        <Modal.Header closeButton>

          <Modal.Title>

            Approve / Reject Requisition

          </Modal.Title>


        </Modal.Header>



        <Modal.Body>


        <Form

          noValidate

          validated={validated}

          onSubmit={handleSaveApproval}

        >


          <Row className="mb-3">

            <Col md={6}>

              <Form.Label>
                Requisition No
              </Form.Label>

              <Form.Control

                disabled

                value={
                  selectedRequest?.JobRequisitionNo || ""
                }

              />

            </Col>



            <Col md={6}>

              <Form.Label>
                Position
              </Form.Label>


              <Form.Control

                disabled

                value={
                  selectedRequest?.Position || ""
                }

              />


            </Col>


          </Row>




          <Row className="mb-3">


            <Col>

              <Form.Label>
                Status
              </Form.Label>


              <Form.Select

                required

                value={
                  formData.status
                }


                onChange={(e)=>

                  setFormData({

                    ...formData,

                    status:
                      e.target.value

                  })

                }

              >

                <option value="">
                  Select
                </option>

                <option value="Approved">
                  Approve
                </option>

                <option value="Rejected">
                  Reject
                </option>


              </Form.Select>


            </Col>


          </Row>




          <Row>

            <Col>


              <Form.Label>
                Comments
              </Form.Label>


              <Form.Control

                as="textarea"

                rows={3}


                value={
                  formData.comments
                }


                onChange={(e)=>

                  setFormData({

                    ...formData,

                    comments:
                      e.target.value

                  })

                }


              />


            </Col>


          </Row>




          <Modal.Footer className="mt-3">


            <Button

              variant="secondary"

              onClick={() =>
                setShowModal(false)
              }

            >

              Cancel

            </Button>



            <Button

              type="submit"

              variant="primary"

            >

              Save

            </Button>


          </Modal.Footer>



        </Form>


        </Modal.Body>


      </Modal>




      <ToastContainer

        position="top-right"

        autoClose={3000}

      />


    </div>

  );

};


export default RecruiterApprovalPage;
