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

interface PayrollSummary {

  department:string;

  employeeCount:number;

  grossSalary:number;

  totalDeductions:number;

  netSalary:number;

  averageSalary:number;

}



// ================= STATIC DATA =================


const payrollData:PayrollSummary[]=[


{
 department:"IT",
 employeeCount:85,
 grossSalary:5525000,
 totalDeductions:425000,
 netSalary:5100000,
 averageSalary:60000
},


{
 department:"HR",
 employeeCount:25,
 grossSalary:1300000,
 totalDeductions:100000,
 netSalary:1200000,
 averageSalary:48000
},


{
 department:"Finance",
 employeeCount:30,
 grossSalary:1650000,
 totalDeductions:135000,
 netSalary:1515000,
 averageSalary:50500
},


{
 department:"Administration",
 employeeCount:15,
 grossSalary:750000,
 totalDeductions:60000,
 netSalary:690000,
 averageSalary:46000
}


];




// ================= COMPONENT =================


const PayrollSummaryReport:React.FC=()=>{





const columns=[


{
key:"department",
label:"Department"
},


{
key:"employeeCount",
label:"Employees"
},


{
key:"grossSalary",
label:"Gross Payroll"
},


{
key:"totalDeductions",
label:"Deductions"
},


{
key:"netSalary",
label:"Net Payroll"
},


{
key:"averageSalary",
label:"Average Salary"
}


];





const totalEmployees = payrollData.reduce(

(sum,x)=>sum+x.employeeCount,

0

);



const totalGross = payrollData.reduce(

(sum,x)=>sum+x.grossSalary,

0

);



const totalDeduction = payrollData.reduce(

(sum,x)=>sum+x.totalDeductions,

0

);



const totalNet = payrollData.reduce(

(sum,x)=>sum+x.netSalary,

0

);






const downloadPDF=()=>{


generatePDF({

title:"Payroll Summary Report",

organizationName:"HRMS Organization",

columns,

data:payrollData,

fileName:"Payroll_Summary_Report"

});


};






const downloadExcel=()=>{


exportExcel({

title:"Payroll Summary Report",

columns,

data:payrollData,

fileName:"Payroll_Summary_Report"

});


};







return (

<Container className="mt-4">



<ReportHeader

title="Payroll Summary Report"

subTitle="Department wise payroll analysis"

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
title:"Total Employees",
value:totalEmployees,
color:"primary"
},


{
title:"Gross Payroll",
value:
`₹ ${totalGross.toLocaleString()}`,
color:"success"
},


{
title:"Total Deductions",
value:
`₹ ${totalDeduction.toLocaleString()}`,
color:"danger"
},


{
title:"Net Payroll",
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

data={payrollData}

/>






</Container>

);


};


export default PayrollSummaryReport;
