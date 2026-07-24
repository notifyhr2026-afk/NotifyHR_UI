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

interface ProfessionalTax {

  employeeId:string;

  employeeName:string;

  department:string;

  state:string;

  grossSalary:number;

  taxSlab:string;

  professionalTax:number;

}



// ================= STATIC DATA =================


const professionalTaxData:ProfessionalTax[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 state:"Telangana",
 grossSalary:65000,
 taxSlab:"Above 20000",
 professionalTax:200
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 state:"Karnataka",
 grossSalary:52000,
 taxSlab:"Above 25000",
 professionalTax:200
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 state:"Tamil Nadu",
 grossSalary:55000,
 taxSlab:"Above 21000",
 professionalTax:208
},


{
 employeeId:"EMP004",
 employeeName:"Arun Kumar",
 department:"Admin",
 state:"Maharashtra",
 grossSalary:45000,
 taxSlab:"Above 30000",
 professionalTax:200
}


];



// ================= COMPONENT =================


const ProfessionalTaxReport:React.FC=()=>{


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
 key:"state",
 label:"State"
},


{
 key:"grossSalary",
 label:"Gross Salary"
},


{
 key:"taxSlab",
 label:"Tax Slab"
},


{
 key:"professionalTax",
 label:"Professional Tax"
}


];





const totalPT =
professionalTaxData.reduce(

(sum,x)=>
sum+x.professionalTax,

0

);





const totalSalary =
professionalTaxData.reduce(

(sum,x)=>
sum+x.grossSalary,

0

);






const downloadPDF=()=>{


generatePDF({

title:"Professional Tax Report",

organizationName:"HRMS Organization",

columns,

data:professionalTaxData,

fileName:"Professional_Tax_Report"

});


};






const downloadExcel=()=>{


exportExcel({

title:"Professional Tax Report",

columns,

data:professionalTaxData,

fileName:"Professional_Tax_Report"

});


};






return (

<Container className="mt-4">



<ReportHeader

title="Professional Tax Report"

subTitle="Employee professional tax deduction details"

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
value:professionalTaxData.length,
color:"primary"
},


{
title:"Gross Salary",
value:
`₹ ${totalSalary.toLocaleString()}`,
color:"info"
},


{
title:"PT Deduction",
value:
`₹ ${totalPT.toLocaleString()}`,
color:"danger"
},


{
title:"States Covered",
value:
new Set(
professionalTaxData.map(
x=>x.state
)
).size,
color:"success"
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

data={professionalTaxData}

/>





</Container>

);


};


export default ProfessionalTaxReport;
