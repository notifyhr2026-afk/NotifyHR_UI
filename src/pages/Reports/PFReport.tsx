import React from "react";

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

interface PFReportData {

  employeeId:string;

  employeeName:string;

  department:string;

  uanNumber:string;

  basicSalary:number;

  employeePF:number;

  employerPF:number;

  totalPF:number;

}



// ================= STATIC DATA =================


const pfData:PFReportData[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 uanNumber:"100200300400",
 basicSalary:50000,
 employeePF:6000,
 employerPF:6000,
 totalPF:12000
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 uanNumber:"100200300401",
 basicSalary:40000,
 employeePF:4800,
 employerPF:4800,
 totalPF:9600
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 uanNumber:"100200300402",
 basicSalary:45000,
 employeePF:5400,
 employerPF:5400,
 totalPF:10800
}


];



// ================= COMPONENT =================


const PFReport:React.FC=()=>{





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
key:"uanNumber",
label:"UAN Number"
},


{
key:"basicSalary",
label:"Basic Salary"
},


{
key:"employeePF",
label:"Employee PF"
},


{
key:"employerPF",
label:"Employer PF"
},


{
key:"totalPF",
label:"Total PF"
}


];





const totalEmployeePF = pfData.reduce(

(sum,x)=>sum+x.employeePF,

0

);



const totalEmployerPF = pfData.reduce(

(sum,x)=>sum+x.employerPF,

0

);



const totalPF = pfData.reduce(

(sum,x)=>sum+x.totalPF,

0

);







const downloadPDF=()=>{


generatePDF({

title:"PF Contribution Report",

organizationName:"HRMS Organization",

columns,

data:pfData,

fileName:"PF_Report"

});


};







const downloadExcel=()=>{


exportExcel({

title:"PF Contribution Report",

columns,

data:pfData,

fileName:"PF_Report"

});


};








return (

<Container className="mt-4">



<ReportHeader

title="PF Contribution Report"

subTitle="Employee and employer provident fund contribution"

organizationName="HRMS Organization"

/>






<ReportFilters

showMonth

showYear

showDepartment={false}

onSearch={()=>{}}

/>







<ReportSummaryCards


cards={[


{
title:"Employees",
value:pfData.length,
color:"primary"
},


{
title:"Employee PF",
value:`₹ ${totalEmployeePF.toLocaleString()}`,
color:"warning"
},


{
title:"Employer PF",
value:`₹ ${totalEmployerPF.toLocaleString()}`,
color:"success"
},


{
title:"Total PF",
value:`₹ ${totalPF.toLocaleString()}`,
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

data={pfData}

/>





</Container>

);


};


export default PFReport;
