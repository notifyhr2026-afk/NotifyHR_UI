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

interface SalaryRegister {

  employeeId:string;

  employeeName:string;

  department:string;

  designation:string;

  basic:number;

  allowances:number;

  grossSalary:number;

  deductions:number;

  netSalary:number;

}


// ================= STATIC DATA =================


const salaryData:SalaryRegister[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 designation:"Software Engineer",
 basic:50000,
 allowances:15000,
 grossSalary:65000,
 deductions:5000,
 netSalary:60000
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 designation:"HR Executive",
 basic:40000,
 allowances:12000,
 grossSalary:52000,
 deductions:4000,
 netSalary:48000
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 designation:"Accountant",
 basic:45000,
 allowances:10000,
 grossSalary:55000,
 deductions:4500,
 netSalary:50500
}


];



// ================= COMPONENT =================


const SalaryRegisterReport:React.FC=()=>{


const [department,setDepartment]=useState("All");



const filteredSalary =

department==="All"

?

salaryData

:

salaryData.filter(
x=>x.department===department
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
key:"basic",
label:"Basic Salary"
},


{
key:"allowances",
label:"Allowances"
},


{
key:"grossSalary",
label:"Gross Salary"
},


{
key:"deductions",
label:"Deductions"
},


{
key:"netSalary",
label:"Net Salary"
}


];





const downloadPDF=()=>{


generatePDF({

title:"Salary Register Report",

organizationName:"HRMS Organization",

columns,

data:filteredSalary,

fileName:"Salary_Register_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Salary Register Report",

columns,

data:filteredSalary,

fileName:"Salary_Register_Report"

});


};





const totalGross = filteredSalary.reduce(

(sum,x)=>sum+x.grossSalary,

0

);



const totalDeduction = filteredSalary.reduce(

(sum,x)=>sum+x.deductions,

0

);



const totalNet = filteredSalary.reduce(

(sum,x)=>sum+x.netSalary,

0

);




return (

<Container className="mt-4">



<ReportHeader

title="Salary Register"

subTitle="Monthly employee salary details"

organizationName="HRMS Organization"

/>





<ReportFilters


showMonth

showYear

showDepartment


department={department}


onDepartmentChange={setDepartment}


onSearch={()=>{}}

/>







<ReportSummaryCards


cards={[


{
title:"Employees",
value:filteredSalary.length,
color:"primary"
},


{
title:"Gross Salary",
value:
`₹ ${totalGross.toLocaleString()}`,
color:"success"
},


{
title:"Deductions",
value:
`₹ ${totalDeduction.toLocaleString()}`,
color:"danger"
},


{
title:"Net Salary",
value:
`₹ ${totalNet.toLocaleString()}`,
color:"info"
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

data={filteredSalary}

/>





</Container>

);


};


export default SalaryRegisterReport;
