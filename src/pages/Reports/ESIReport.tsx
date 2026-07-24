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

interface ESIReportData {

  employeeId:string;

  employeeName:string;

  department:string;

  esiNumber:string;

  grossSalary:number;

  employeeContribution:number;

  employerContribution:number;

  totalContribution:number;

}


// ================= STATIC DATA =================


const esiData:ESIReportData[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 esiNumber:"ESI100200300",
 grossSalary:21000,
 employeeContribution:158,
 employerContribution:683,
 totalContribution:841
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 esiNumber:"ESI100200301",
 grossSalary:20000,
 employeeContribution:150,
 employerContribution:650,
 totalContribution:800
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 esiNumber:"ESI100200302",
 grossSalary:19500,
 employeeContribution:146,
 employerContribution:634,
 totalContribution:780
}


];



// ================= COMPONENT =================


const ESIReport:React.FC=()=>{


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
 key:"esiNumber",
 label:"ESI Number"
},


{
 key:"grossSalary",
 label:"Gross Wages"
},


{
 key:"employeeContribution",
 label:"Employee ESI"
},


{
 key:"employerContribution",
 label:"Employer ESI"
},


{
 key:"totalContribution",
 label:"Total Contribution"
}


];





const totalEmployeeESI =
esiData.reduce(
(sum,x)=>
sum+x.employeeContribution,
0
);



const totalEmployerESI =
esiData.reduce(
(sum,x)=>
sum+x.employerContribution,
0
);



const totalESI =
esiData.reduce(
(sum,x)=>
sum+x.totalContribution,
0
);






const downloadPDF=()=>{


generatePDF({

title:"ESI Contribution Report",

organizationName:"HRMS Organization",

columns,

data:esiData,

fileName:"ESI_Report"

});


};







const downloadExcel=()=>{


exportExcel({

title:"ESI Contribution Report",

columns,

data:esiData,

fileName:"ESI_Report"

});


};






return (

<Container className="mt-4">



<ReportHeader

title="ESI Contribution Report"

subTitle="Employee State Insurance contribution details"

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
 value:esiData.length,
 color:"primary"
},


{
 title:"Employee ESI",
 value:
 `₹ ${totalEmployeeESI.toLocaleString()}`,
 color:"warning"
},


{
 title:"Employer ESI",
 value:
 `₹ ${totalEmployerESI.toLocaleString()}`,
 color:"success"
},


{
 title:"Total ESI",
 value:
 `₹ ${totalESI.toLocaleString()}`,
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

data={esiData}

/>






</Container>

);


};


export default ESIReport;
