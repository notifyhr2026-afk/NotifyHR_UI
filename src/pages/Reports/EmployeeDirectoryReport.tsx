import React, { useState } from "react";

import {
  Container,
  Form
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

interface EmployeeDirectory {

  employeeId:string;

  employeeName:string;

  department:string;

  designation:string;

  branch:string;

  email:string;

  mobile:string;

  extension:string;

  status:string;

}



// ================= STATIC DATA =================


const employeeDirectoryData:EmployeeDirectory[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 designation:"Software Engineer",
 branch:"Hyderabad",
 email:"john.smith@company.com",
 mobile:"9876543210",
 extension:"101",
 status:"Active"
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 designation:"HR Executive",
 branch:"Bangalore",
 email:"rahul.kumar@company.com",
 mobile:"9876543211",
 extension:"102",
 status:"Active"
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 designation:"Accountant",
 branch:"Chennai",
 email:"priya.sharma@company.com",
 mobile:"9876543212",
 extension:"103",
 status:"Inactive"
}


];



// ================= COMPONENT =================


const EmployeeDirectoryReport:React.FC=()=>{


const [department,setDepartment]=useState("All");

const [search,setSearch]=useState("");



const filteredEmployees = employeeDirectoryData.filter(
(emp)=>{


const deptMatch =

department==="All"

?

true

:

emp.department===department;



const searchMatch =

emp.employeeName
.toLowerCase()
.includes(
search.toLowerCase()
)

||

emp.employeeId
.toLowerCase()
.includes(
search.toLowerCase()
);



return deptMatch && searchMatch;


}

);





const columns=[


{
key:"employeeId",
label:"Employee ID"
},


{
key:"employeeName",
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
key:"mobile",
label:"Mobile"
},


{
key:"extension",
label:"Ext"
},


{
key:"status",
label:"Status",

render:(row:EmployeeDirectory)=>(

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

title:"Employee Directory Report",

organizationName:"HRMS Organization",

columns,

data:filteredEmployees,

fileName:"Employee_Directory_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Employee Directory Report",

columns,

data:filteredEmployees,

fileName:"Employee_Directory_Report"

});


};





return (

<Container className="mt-4">


<ReportHeader

title="Employee Directory"

subTitle="Employee contact information directory"

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





<div className="mb-3">


<Form.Control

placeholder="Search Employee Name / ID"

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

/>


</div>






<ReportSummaryCards

cards={[


{
title:"Total Employees",
value:employeeDirectoryData.length,
color:"primary"
},


{
title:"Active Employees",
value:
employeeDirectoryData.filter(
x=>x.status==="Active"
).length,
color:"success"
},


{
title:"Departments",
value:
new Set(
employeeDirectoryData.map(
x=>x.department
)
).size,
color:"info"
},


{
title:"Branches",
value:
new Set(
employeeDirectoryData.map(
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

data={filteredEmployees}

/>






</Container>

);


};


export default EmployeeDirectoryReport;
