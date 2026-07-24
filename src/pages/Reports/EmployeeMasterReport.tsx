import React, { useState } from "react";

import {
  Container
} from "react-bootstrap";

import ReportHeader 
from "./components/ReportHeader";

import ReportFilters 
from "./components/ReportFilters";

import ReportSummaryCards 
from "./components/ReportSummaryCards";

import ReportTable 
from "./components/ReportTable";

import PrintButton 
from "./components/PrintButton";

import { generatePDF }
from "./components/PDFGenerator";

import { exportExcel }
from "./components/ExcelExporter";


interface Employee {

  employeeId:string;

  name:string;

  department:string;

  designation:string;

  branch:string;

  email:string;

  phone:string;

  status:string;

}



const employees:Employee[]=[

{
 employeeId:"EMP001",
 name:"John Smith",
 department:"IT",
 designation:"Software Engineer",
 branch:"Hyderabad",
 email:"john@company.com",
 phone:"9876543210",
 status:"Active"
},

{
 employeeId:"EMP002",
 name:"Rahul Kumar",
 department:"HR",
 designation:"HR Executive",
 branch:"Bangalore",
 email:"rahul@company.com",
 phone:"9876543211",
 status:"Active"
},

{
 employeeId:"EMP003",
 name:"Priya Sharma",
 department:"Finance",
 designation:"Accountant",
 branch:"Chennai",
 email:"priya@company.com",
 phone:"9876543212",
 status:"Inactive"
}

];



const EmployeeMasterReport:React.FC =()=>{


const [department,setDepartment]=useState("All");



const filteredEmployees =
department==="All"
?
employees
:
employees.filter(
 e=>e.department===department
);



const columns=[

{
 key:"employeeId",
 label:"Employee ID"
},

{
 key:"name",
 label:"Employee Name"
},

{
 key:"department",
 label:"Department"
},

{
 key:"designation",
 label:"Designation"
},

{
 key:"branch",
 label:"Branch"
},

{
 key:"email",
 label:"Email"
},

{
 key:"phone",
 label:"Phone"
},

{
 key:"status",
 label:"Status",

 render:(row:Employee)=>(

 <span
 className={
 row.status==="Active"
 ?
 "badge bg-success"
 :
 "badge bg-danger"
 }
 >

 {row.status}

 </span>

 )

}

];



const handlePDF=()=>{


generatePDF({

 title:"Employee Master Report",

 organizationName:"HRMS Organization",

 columns,

 data:filteredEmployees,

 fileName:"Employee_Master_Report"

});


};



const handleExcel=()=>{


exportExcel({

 title:"Employee Master Report",

 columns,

 data:filteredEmployees,

 fileName:"Employee_Master_Report"

});


};



return (

<Container className="mt-4">


<ReportHeader

title="Employee Master Report"

subTitle="Complete employee directory"

organizationName="HRMS Organization"

/>



<ReportFilters

showMonth={false}

showYear={false}

showDepartment

department={department}

onDepartmentChange={setDepartment}

onSearch={()=>{}}

/>



<ReportSummaryCards

cards={[

{
 title:"Total Employees",
 value:employees.length,
 color:"primary"
},

{
 title:"Active Employees",
 value:
 employees.filter(
 e=>e.status==="Active"
 ).length,
 color:"success"
},

{
 title:"Inactive Employees",
 value:
 employees.filter(
 e=>e.status==="Inactive"
 ).length,
 color:"danger"
},

{
 title:"Departments",
 value:
 new Set(
 employees.map(
 e=>e.department
 )
 ).size,
 color:"info"
}

]}

/>



<div className="mb-3 d-flex gap-2">


<button

className="btn btn-success"

onClick={handleExcel}

>

Download Excel

</button>



<button

className="btn btn-primary"

onClick={handlePDF}

>

Download PDF

</button>



<PrintButton />

</div>



<ReportTable

columns={columns}

data={filteredEmployees}

/>



</Container>

);


};



export default EmployeeMasterReport;
