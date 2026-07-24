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


// ================= TYPES =================

interface Department {

  departmentId:string;

  departmentName:string;

  branch:string;

  departmentHead:string;

  employees:number;

  activeEmployees:number;

  status:string;

}


// ================= STATIC DATA =================


const departmentData:Department[]=[


{
 departmentId:"DEPT001",
 departmentName:"Information Technology",
 branch:"Hyderabad",
 departmentHead:"Rajesh Kumar",
 employees:85,
 activeEmployees:82,
 status:"Active"
},


{
 departmentId:"DEPT002",
 departmentName:"Human Resources",
 branch:"Bangalore",
 departmentHead:"Anita Sharma",
 employees:25,
 activeEmployees:24,
 status:"Active"
},


{
 departmentId:"DEPT003",
 departmentName:"Finance",
 branch:"Chennai",
 departmentHead:"Priya Reddy",
 employees:30,
 activeEmployees:28,
 status:"Active"
},


{
 departmentId:"DEPT004",
 departmentName:"Administration",
 branch:"Hyderabad",
 departmentHead:"Suresh Kumar",
 employees:15,
 activeEmployees:0,
 status:"Inactive"
}


];



// ================= COMPONENT =================


const DepartmentReport:React.FC=()=>{


const [status,setStatus]=useState("All");



const filteredDepartments =

status==="All"

?

departmentData

:

departmentData.filter(

d=>d.status===status

);





const columns=[


{
key:"departmentId",
label:"Department ID"
},


{
key:"departmentName",
label:"Department Name"
},


{
key:"branch",
label:"Branch"
},


{
key:"departmentHead",
label:"Department Head"
},


{
key:"employees",
label:"Total Employees"
},


{
key:"activeEmployees",
label:"Active Employees"
},


{
key:"status",
label:"Status",

render:(row:Department)=>(

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






const downloadPDF=()=>{


generatePDF({

title:"Department Report",

organizationName:"HRMS Organization",

columns,

data:filteredDepartments,

fileName:"Department_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Department Report",

columns,

data:filteredDepartments,

fileName:"Department_Report"

});


};





return (

<Container className="mt-4">



<ReportHeader

title="Department Report"

subTitle="Department wise employee distribution"

organizationName="HRMS Organization"

/>




<ReportFilters


showMonth={false}

showYear={false}

showStatus


status={status}


onStatusChange={setStatus}


onSearch={()=>{}}


/>






<ReportSummaryCards

cards={[


{
title:"Total Departments",
value:departmentData.length,
color:"primary"
},


{
title:"Active Departments",
value:
departmentData.filter(
x=>x.status==="Active"
).length,
color:"success"
},


{
title:"Total Employees",
value:
departmentData.reduce(
(sum,x)=>
sum+x.employees,
0
),
color:"info"
},


{
title:"Branches Covered",
value:
new Set(
departmentData.map(
x=>x.branch
)
).size,
color:"warning"
}


]}

/>







<div className="mb-3 d-flex gap-2">


<button

className="btn btn-primary"

onClick={downloadPDF}

>

Download PDF

</button>




<button

className="btn btn-success"

onClick={downloadExcel}

>

Download Excel

</button>




<PrintButton />



</div>






<ReportTable

columns={columns}

data={filteredDepartments}

/>





</Container>

);


};


export default DepartmentReport;
