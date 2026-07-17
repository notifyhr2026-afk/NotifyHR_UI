import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import {
  toast,
  ToastContainer,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import candidateService from "../../services/candidateService";


// ================= TYPES =================

interface Candidate {

  CandidateID: number;

  FirstName: string;

  LastName: string;

  Email: string;

  Phone: string;

  LinkedInProfile: string;

  ResumeFileName: string;

  ResumePath?: string;

  Status: string;

  Skills: string;

}



// ================= STATIC DATA =================

const skillOptions = [
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Java",
  "Python",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
];



// ================= COMPONENT =================

const CandidateList: React.FC = () => {


  const navigate = useNavigate();


  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  const organizationID =
    user?.organizationID;


  // recruitmentID = employeeID
  const recruitmentID =
    user?.employeeID;


  const employeeName =
    user?.fullName;



  const [candidates,setCandidates] =
    useState<Candidate[]>([]);


  const [filteredCandidates,setFilteredCandidates] =
    useState<Candidate[]>([]);


  const [searchTerm,setSearchTerm] =
    useState("");


  const [loading,setLoading] =
    useState(true);


  const [saving,setSaving] =
    useState(false);


  const [showModal,setShowModal] =
    useState(false);


  const [validated,setValidated] =
    useState(false);



  const [skillSearch,setSkillSearch] =
    useState("");


  const [showSkillDropdown,setShowSkillDropdown] =
    useState(false);



  const [formData,setFormData] =
    useState<Candidate>({

      CandidateID:0,

      FirstName:"",

      LastName:"",

      Email:"",

      Phone:"",

      LinkedInProfile:"",

      ResumeFileName:"",

      Status:"New",

      Skills:"",

    });



  // ================= LOAD CANDIDATES =================


  useEffect(()=>{

    loadCandidates();

  },[]);



  const loadCandidates = async()=>{

    try{

      setLoading(true);


      const response =
        await candidateService
        .GetCandidatesByOrganizationAsync(
          organizationID,
          recruitmentID
        );


      const mapped =
        response.map((x:any)=>({

          CandidateID:
            x.CandidateID ?? 0,

          FirstName:
            x.FirstName ?? "",

          LastName:
            x.LastName ?? "",

          Email:
            x.Email ?? "",

          Phone:
            x.Phone ?? "",

          LinkedInProfile:
            x.LinkedInProfile ?? "",

          ResumeFileName:
            x.ResumePath
              ? x.ResumePath.split("/").pop()
              : "",

          ResumePath:
            x.ResumePath,

          Status:
            x.Status ?? "New",

          Skills:
            x.Skills ?? "",

        }));


      setCandidates(mapped);

      setFilteredCandidates(mapped);



    }
    catch(error){

      console.error(error);

      toast.error(
        "Failed to load candidates"
      );

    }
    finally{

      setLoading(false);

    }

  };



  // ================= SEARCH =================


  useEffect(()=>{

    const data =
      candidates.filter((c)=>

        c.FirstName
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

        ||

        c.LastName
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

        ||

        c.Email
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

        ||

        c.Skills
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )

      );


    setFilteredCandidates(data);


  },[
    searchTerm,
    candidates
  ]);



  // ================= INPUT CHANGE =================


  const handleChange =
  (
    e:React.ChangeEvent<any>
  )=>{


    const {
      id,
      value
    } = e.target;


    setFormData(prev=>({

      ...prev,

      [id]:value

    }));

  };



  // ================= RESUME =================


  const handleResumeUpload =
  (
    e:React.ChangeEvent<HTMLInputElement>
  )=>{


    if(e.target.files?.length){

      const file =
        e.target.files[0];


      setFormData(prev=>({

        ...prev,

        ResumeFileName:file.name,

        ResumePath:file.name

      }));

    }

  };



  // ================= ADD SKILL =================


  const addSkill=(skill:string)=>{


    const existing =
      formData.Skills
      .split(",")
      .map(x=>x.trim())
      .filter(Boolean);



    if(existing.includes(skill)){

      toast.warning(
        "Skill already added"
      );

      return;

    }


    setFormData(prev=>({

      ...prev,

      Skills:[
        ...existing,
        skill
      ].join(", ")

    }));


    setSkillSearch("");

    setShowSkillDropdown(false);


  };
    // ================= SAVE CANDIDATE =================

  const handleSaveCandidate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    const form = e.currentTarget;


    if (!form.checkValidity()) {

      e.stopPropagation();

      setValidated(true);

      toast.warning(
        "Please fill all required fields"
      );

      return;

    }


    try {

      setSaving(true);


      const payload = {

        firstName:
          formData.FirstName,

        lastName:
          formData.LastName,

        email:
          formData.Email,

        phone:
          formData.Phone,

        linkedInProfile:
          formData.LinkedInProfile,

        resumePath:
          formData.ResumePath ||
          formData.ResumeFileName,

        skills:
          formData.Skills,

        createdBy:
          employeeName,

        organizationID:
          organizationID,

        recruitmentID:
          recruitmentID,

      };


      await candidateService.PostCandidateAsync(
        payload
      );


      toast.success(
        "Candidate added successfully"
      );


      setShowModal(false);


      setValidated(false);


      resetForm();


      await loadCandidates();



    } catch(error){

      console.error(error);

      toast.error(
        "Failed to save candidate"
      );


    } finally {

      setSaving(false);

    }

  };



  // ================= RESET FORM =================


  const resetForm = () => {

    setFormData({

      CandidateID:0,

      FirstName:"",

      LastName:"",

      Email:"",

      Phone:"",

      LinkedInProfile:"",

      ResumeFileName:"",

      ResumePath:"",

      Status:"New",

      Skills:"",

    });


    setSkillSearch("");

  };



  // ================= OPEN ADD =================


  const openAddCandidate = () => {


    resetForm();


    setValidated(false);


    setShowModal(true);


  };



  // ================= MANAGE CANDIDATE =================


  const openManageCandidate = (
    candidate:Candidate
  )=>{


    navigate(
      `/candidates/manage/${candidate.CandidateID}`
    );


  };



  // ================= RENDER =================


  if(loading){

    return (

      <div className="text-center mt-5">

        <Spinner animation="border"/>

      </div>

    );

  }


  return (
    <div className="Container">

      <h2 className="mb-4">
        Candidate List
      </h2>


      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">


        <Form.Control

          type="text"

          placeholder="Search by name, email, or skills..."

          value={searchTerm}

          onChange={
            e=>setSearchTerm(
              e.target.value
            )
          }

          style={{
            maxWidth:"400px"
          }}

        />


        <Button
          variant="success"
          onClick={openAddCandidate}
        >

          + Add Candidate

        </Button>


      </div>



      <div className="table-responsive">


        <table className="table table-hover table-dark-custom">


          <thead>

            <tr>

              <th>Name</th>

              <th>Email</th>

              <th>Status</th>

              <th>Skills</th>

              <th>Resume</th>

              <th>Action</th>

            </tr>

          </thead>



          <tbody>


          {
            filteredCandidates.length > 0 ?


            filteredCandidates.map(candidate=>(


              <tr
                key={
                  candidate.CandidateID
                }
              >


                <td>

                  {
                    candidate.FirstName
                  }{" "}

                  {
                    candidate.LastName
                  }

                </td>


                <td>

                  {
                    candidate.Email
                  }

                </td>


                <td>

                  <span className="badge bg-primary">

                    {
                      candidate.Status
                    }

                  </span>

                </td>


                <td>

                  {
                    candidate.Skills
                  }

                </td>


                <td>

                  {
                    candidate.ResumeFileName
                    ||
                    "-"
                  }

                </td>


                <td>

                  <Button

                    size="sm"

                    variant="primary"

                    onClick={()=>
                      openManageCandidate(
                        candidate
                      )
                    }

                  >

                    Manage

                  </Button>


                </td>


              </tr>


            ))

            :

            (

              <tr>

                <td
                  colSpan={6}
                  className="text-center"
                >

                  No candidates found

                </td>

              </tr>

            )

          }


          </tbody>


        </table>


      </div>
            {/* ================= ADD CANDIDATE MODAL ================= */}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >

        <Modal.Header closeButton>

          <Modal.Title>
            Add Candidate
          </Modal.Title>

        </Modal.Header>



        <Modal.Body>


          <Form
            noValidate
            validated={validated}
            onSubmit={handleSaveCandidate}
          >


            <Row className="mb-3">


              <Col md={6}>

                <Form.Group controlId="FirstName">

                  <Form.Label>
                    First Name
                  </Form.Label>


                  <Form.Control

                    required

                    value={
                      formData.FirstName
                    }

                    onChange={
                      handleChange
                    }

                  />


                  <Form.Control.Feedback type="invalid">

                    Enter first name

                  </Form.Control.Feedback>


                </Form.Group>


              </Col>



              <Col md={6}>


                <Form.Group controlId="LastName">


                  <Form.Label>
                    Last Name
                  </Form.Label>


                  <Form.Control

                    required

                    value={
                      formData.LastName
                    }

                    onChange={
                      handleChange
                    }

                  />


                  <Form.Control.Feedback type="invalid">

                    Enter last name

                  </Form.Control.Feedback>


                </Form.Group>


              </Col>


            </Row>



            <Row className="mb-3">


              <Col md={6}>


                <Form.Group controlId="Email">


                  <Form.Label>
                    Email
                  </Form.Label>


                  <Form.Control

                    type="email"

                    required

                    value={
                      formData.Email
                    }

                    onChange={
                      handleChange
                    }

                  />


                  <Form.Control.Feedback type="invalid">

                    Enter valid email

                  </Form.Control.Feedback>


                </Form.Group>


              </Col>



              <Col md={6}>


                <Form.Group controlId="Phone">


                  <Form.Label>
                    Phone
                  </Form.Label>


                  <Form.Control

                    required

                    value={
                      formData.Phone
                    }

                    onChange={
                      handleChange
                    }

                  />


                  <Form.Control.Feedback type="invalid">

                    Enter phone number

                  </Form.Control.Feedback>


                </Form.Group>


              </Col>


            </Row>



            <Row className="mb-3">


              <Col md={6}>


                <Form.Group controlId="LinkedInProfile">


                  <Form.Label>
                    LinkedIn Profile
                  </Form.Label>


                  <Form.Control

                    value={
                      formData.LinkedInProfile
                    }

                    onChange={
                      handleChange
                    }

                  />


                </Form.Group>


              </Col>



              <Col md={6}>


                <Form.Label>
                  Resume Upload
                </Form.Label>


                <Form.Control

                  type="file"

                  accept=".pdf,.doc,.docx"

                  onChange={
                    handleResumeUpload
                  }

                />


                {
                  formData.ResumeFileName &&

                  <small className="text-muted">

                    Uploaded:
                    {" "}
                    {
                      formData.ResumeFileName
                    }

                  </small>

                }


              </Col>


            </Row>



            <Row className="mb-3">


              <Col md={6}
                style={{
                  position:"relative"
                }}
              >


                <Form.Label>
                  Search Skill
                </Form.Label>


                <Form.Control

                  value={
                    skillSearch
                  }

                  onChange={
                    e=>{

                      setSkillSearch(
                        e.target.value
                      );

                      setShowSkillDropdown(true);

                    }
                  }

                />



                {
                  showSkillDropdown &&

                  <div

                    className="border bg-white mt-1 position-absolute w-100"

                    style={{
                      zIndex:1000
                    }}

                  >


                    {
                      skillOptions

                      .filter(skill=>

                        skill
                        .toLowerCase()
                        .includes(
                          skillSearch
                          .toLowerCase()
                        )

                        &&

                        !formData.Skills.includes(
                          skill
                        )

                      )

                      .map(skill=>(


                        <div

                          key={skill}

                          className="p-2"

                          style={{
                            cursor:"pointer"
                          }}

                          onMouseDown={()=>
                            addSkill(skill)
                          }

                        >

                          {
                            skill
                          }

                        </div>


                      ))

                    }


                  </div>

                }


              </Col>




              <Col md={6}>


                <Form.Group controlId="Skills">


                  <Form.Label>
                    Selected Skills
                  </Form.Label>


                  <Form.Control

                    as="textarea"

                    rows={3}

                    value={
                      formData.Skills
                    }

                    onChange={
                      handleChange
                    }

                  />


                </Form.Group>


              </Col>


            </Row>



            <div className="d-flex justify-content-end">


              <Button

                variant="secondary"

                className="me-2"

                onClick={()=>
                  setShowModal(false)
                }

              >

                Cancel

              </Button>



              <Button

                type="submit"

                variant="primary"

                disabled={saving}

              >


                {
                  saving ?

                  <Spinner
                    animation="border"
                    size="sm"
                  />

                  :

                  "Save"

                }


              </Button>


            </div>



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


export default CandidateList;