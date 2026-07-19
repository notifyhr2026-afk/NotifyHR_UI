import React, {
  useState,
  useEffect
} from "react";

import {
  Row,
  Col,
  Form,
  Button,
  Spinner
} from "react-bootstrap";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  toast
} from "react-toastify";

import candidateService from "../../services/candidateService";


// ================= TYPES =================

interface CandidateForm {
  CandidateID: number;
  OrganizationID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  LinkedInProfile: string;
  ResumeFileName: string;
  ResumePath: string;
  CurrentStatus: string;
  Skills: string;
  TotalExperienceYears: number;
  CurrentEmployer: string;
  CurrentRole: string;
  ExpectedMinSalary: number;
  ExpectedMaxSalary: number;
  CurrentSalary: number;
}
// ================= CONSTANTS =================

const statusList = [
  "New",
  "Screening",
  "Interview Scheduled",
  "Hired",
  "Rejected"
];

const skillOptions = [
  "React",
  "Node.js",
  "Angular",
  "Vue.js",
  "SQL",
  "JavaScript",
  "Java",
  "Python"
];

// ================= COMPONENT =================

const CandidateDetails: React.FC = () => {

  const {
    CandidateID
  } = useParams<{
    CandidateID: string
  }>();

  const navigate =
    useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );

  const organizationID =
    user?.organizationID;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [validated, setValidated] =
    useState(false);

  const [skillSearch, setSkillSearch] =
    useState("");

  const [showSkillDropdown, setShowSkillDropdown] =
    useState(false);

  const [formData, setFormData] =
    useState<CandidateForm>({
      CandidateID: 0,
      OrganizationID: organizationID,
      FirstName: "",
      LastName: "",
      Email: "",
      Phone: "",
      LinkedInProfile: "",
      ResumeFileName: "",
      ResumePath: "",
      CurrentStatus: "New",
      Skills: "",
      TotalExperienceYears: 0,
      CurrentEmployer: "",
      CurrentRole: "",
      ExpectedMinSalary: 0,
      ExpectedMaxSalary: 0,
      CurrentSalary: 0
    });

  // ================= LOAD CANDIDATE =================

  useEffect(() => {
    if (CandidateID) {
      loadCandidate();
    }
  }, [
    CandidateID
  ]);

const loadCandidate = async () => {
  try {

    setLoading(true);

    const response =
      await candidateService.GetCandidateByIDAsync(
        organizationID,
        Number(CandidateID)
      );


    const data =
      Array.isArray(response)
        ? response[0]
        : response;


    if (!data) {

      toast.error(
        "Candidate not found"
      );

      navigate("/candidates");

      return;

    }



    setFormData({

      CandidateID:
        data.CandidateID || 0,


      OrganizationID:
        data.OrganizationID || organizationID,


      FirstName:
        data.FirstName || "",


      LastName:
        data.LastName || "",


      Email:
        data.Email || "",


      Phone:
        data.Phone || "",


      LinkedInProfile:
        data.LinkedInProfile || "",



      ResumeFileName:
        data.ResumePath
          ?
          data.ResumePath.split("/").pop()
          :
          "",



      ResumePath:
        data.ResumePath || "",



      CurrentStatus:
        data.CurrentStatus || "New",



      Skills:
        data.skills || "",



      TotalExperienceYears:
        data.TotalExperienceYears || 0,



      CurrentEmployer:
        data.CurrentEmployer || "",



      CurrentRole:
        data.CurrentRole || "",



      ExpectedMinSalary:
        data.ExpectedMinSalary || 0,



      ExpectedMaxSalary:
        data.ExpectedMaxSalary || 0,



      CurrentSalary:
        data.CurrentSalary || 0

    });


  }
  catch(error){

    console.error(error);

    toast.error(
      "Unable to load candidate"
    );

  }
  finally{

    setLoading(false);

  }
};

  // ================= INPUT CHANGE =================
  const handleChange =
    (
      e: React.ChangeEvent<any>
    ) => {
      const {
        id,
        value
      } = e.target;
      setFormData(prev => ({
        ...prev,
        [id]:
          [
            "TotalExperienceYears",
            "ExpectedMinSalary",
            "ExpectedMaxSalary",
            "CurrentSalary"
          ].includes(id)
            ?
            Number(value)
            :
            value
      }));


    };




  // ================= RESUME =================


  const handleResumeUpload =
    (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {


      const file =
        e.target.files?.[0];


      if (file) {


        setFormData(prev => ({

          ...prev,

          ResumeFileName:
            file.name,


          ResumePath:
            file.name


        }));

      }


    };




  // ================= ADD SKILL =================


  const addSkill = (skill: string) => {


    const existing =
      formData.Skills
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);



    if (existing.includes(skill)) {

      return;

    }



    setFormData(prev => ({

      ...prev,

      Skills:
        [
          ...existing,
          skill
        ].join(", ")

    }));


    setSkillSearch("");

    setShowSkillDropdown(false);


  };
  // ================= SAVE CANDIDATE =================

  const handleSaveCandidate =
    async (
      e: React.FormEvent<HTMLFormElement>
    ) => {


      e.preventDefault();


      const form =
        e.currentTarget;



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


          candidateID:
            formData.CandidateID,


          organizationID:
            organizationID,


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
            formData.ResumePath,


          skills:
            formData.Skills,


          currentStatus:
            formData.CurrentStatus,


          totalExperienceYears:
            formData.TotalExperienceYears,


          currentEmployer:
            formData.CurrentEmployer,


          currentRole:
            formData.CurrentRole,


          expectedMinSalary:
            formData.ExpectedMinSalary,


          expectedMaxSalary:
            formData.ExpectedMaxSalary,


          currentSalary:
            formData.CurrentSalary


        };



        await candidateService.PutCandidateAsync(
          payload
        );



        toast.success(
          "Candidate updated successfully"
        );



        await loadCandidate();



      }
      catch (error) {


        console.error(error);


        toast.error(
          "Failed to update candidate"
        );


      }
      finally {


        setSaving(false);


      }


    };




  // ================= LOADING =================


  if (loading) {


    return (

      <div className="text-center mt-5">


        <Spinner animation="border" />


      </div>

    );


  }





  return (

    <div className="mt-3">
      <Form

        noValidate

        validated={validated}

        onSubmit={
          handleSaveCandidate
        }

      >



        {/* ================= NAME ================= */}


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


            </Form.Group>


          </Col>


        </Row>





        {/* ================= EMAIL PHONE ================= */}



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


            </Form.Group>


          </Col>


        </Row>





        {/* ================= LINKEDIN RESUME ================= */}



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
              Resume
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
        {/* ================= EXPERIENCE ================= */}

        <Row className="mb-3">

          <Col md={4}>

            <Form.Group controlId="TotalExperienceYears">

              <Form.Label>
                Total Experience (Years)
              </Form.Label>


              <Form.Control

                type="number"

                min={0}

                value={
                  formData.TotalExperienceYears
                }

                onChange={
                  handleChange
                }

              />

            </Form.Group>


          </Col>



          <Col md={4}>


            <Form.Group controlId="CurrentEmployer">


              <Form.Label>
                Current Employer
              </Form.Label>


              <Form.Control

                value={
                  formData.CurrentEmployer
                }

                onChange={
                  handleChange
                }

              />


            </Form.Group>


          </Col>



          <Col md={4}>


            <Form.Group controlId="CurrentRole">


              <Form.Label>
                Current Role
              </Form.Label>


              <Form.Control

                value={
                  formData.CurrentRole
                }

                onChange={
                  handleChange
                }

              />


            </Form.Group>


          </Col>


        </Row>




        {/* ================= SALARY ================= */}



        <Row className="mb-3">


          <Col md={4}>


            <Form.Group controlId="CurrentSalary">


              <Form.Label>
                Current Salary
              </Form.Label>


              <Form.Control

                type="number"

                min={0}

                step="0.1"

                value={
                  formData.CurrentSalary
                }

                onChange={
                  handleChange
                }

              />


            </Form.Group>


          </Col>




          <Col md={4}>


            <Form.Group controlId="ExpectedMinSalary">


              <Form.Label>
                Expected Min Salary
              </Form.Label>


              <Form.Control

                type="number"

                min={0}

                step="0.1"

                value={
                  formData.ExpectedMinSalary
                }

                onChange={
                  handleChange
                }

              />


            </Form.Group>


          </Col>




          <Col md={4}>


            <Form.Group controlId="ExpectedMaxSalary">


              <Form.Label>
                Expected Max Salary
              </Form.Label>


              <Form.Control

                type="number"

                min={0}

                step="0.1"

                value={
                  formData.ExpectedMaxSalary
                }

                onChange={
                  handleChange
                }

              />


            </Form.Group>


          </Col>


        </Row>





        {/* ================= STATUS ================= */}



        <Row className="mb-3">


          <Col md={4}>


            <Form.Group controlId="CurrentStatus">


              <Form.Label>
                Current Status
              </Form.Label>


              <Form.Select

                value={
                  formData.CurrentStatus
                }

                onChange={
                  handleChange
                }

              >


                {
                  statusList.map(status => (

                    <option
                      key={status}
                      value={status}
                    >

                      {status}

                    </option>

                  ))

                }


              </Form.Select>


            </Form.Group>


          </Col>


        </Row>






        {/* ================= SKILLS ================= */}



        <Row className="mb-3">


          <Col
            md={6}
            style={{
              position: "relative"
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
                e => {

                  setSkillSearch(
                    e.target.value
                  );

                  setShowSkillDropdown(
                    true
                  );

                }
              }


            />



            {
              showSkillDropdown &&
              skillSearch &&


              <div

                className="border bg-white mt-1 position-absolute w-100"

                style={{
                  zIndex: 1000
                }}

              >


                {

                  skillOptions

                    .filter(skill =>

                      skill
                        .toLowerCase()
                        .includes(
                          skillSearch
                            .toLowerCase()
                        )

                      &&

                      !formData.Skills
                        .includes(skill)

                    )

                    .map(skill => (


                      <div

                        key={skill}

                        className="p-2"

                        style={{
                          cursor: "pointer"
                        }}

                        onMouseDown={() =>
                          addSkill(skill)
                        }

                      >

                        {skill}

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






        {/* ================= BUTTONS ================= */}



        <div className="d-flex justify-content-end">


          <Button

            variant="secondary"

            className="me-2"

            onClick={() =>
              navigate("/candidates")
            }

          >

            Cancel

          </Button>




          <Button

            type="submit"

            variant="primary"

            disabled={
              saving
            }

          >

            {
              saving ?

                <Spinner

                  animation="border"

                  size="sm"

                />

                :

                "Update Candidate"

            }


          </Button>


        </div>



      </Form>


    </div>

  );


};



export default CandidateDetails;