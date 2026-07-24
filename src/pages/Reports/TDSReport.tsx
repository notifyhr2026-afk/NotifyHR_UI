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

interface TDSReportData {

  employeeId:string;

  employeeName:string;

  department:string;

  panNumber:string;

  annualIncome:number;

  taxableIncome:number;

  monthlyTDS:number;

  annualTDS:number;

}


// ================= STATIC DATA =================


const tdsData:TDSReportData[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 panNumber:"ABCDE1234F",
 annualIncome:780000,
 taxableIncome:720000,
 monthlyTDS:3500,
 annualTDS:42000
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 panNumber:"FGHIJ5678K",
 annualIncome:624000,
 taxableIncome:580000,
 monthlyTDS:2200,
 annualTDS:26400
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 panNumber:"LMNOP9012Q",
 annualIncome:660000,
 taxableIncome:620000,
 monthlyTDS:2600,
 annualTDS:31200
}


];



// ================= COMPONENT =================


const TDSReport:React.FC=()=>{



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
key:"panNumber",
label:"PAN Number"
},


{
key:"annualIncome",
label:"Annual Income"
},


{
key:"taxableIncome",
label:"Taxable Income"
},


{
key:"monthlyTDS",
label:"Monthly TDS"
},


{
key:"annualTDS",
label:"Annual TDS"
}


];





const totalIncome =
tdsData.reduce(

(sum,x)=>
sum+x.annualIncome,

0

);



const totalTaxable =
tdsData.reduce(

(sum,x)=>
sum+x.taxableIncome,

0

);



const totalTDS =
tdsData.reduce(

(sum,x)=>
sum+x.annualTDS,

0

);






const downloadPDF=()=>{


generatePDF({

title:"TDS Report",

organizationName:"HRMS Organization",

columns,

data:tdsData,

fileName:"TDS_Report"

});


};






const downloadExcel=()=>{


exportExcel({

title:"TDS Report",

columns,

data:tdsData,

fileName:"TDS_Report"

});


};






return (

<Container className="mt-4">



<ReportHeader

title="TDS Report"

subTitle="Employee income tax deduction details"

organizationName="HRMS Organization"

/>






<ReportFilters

showMonth={false}

showYear

showDepartment={false}

onSearch={()=>{}}

/>







<ReportSummaryCards


cards={[


{
title:"Employees",
value:tdsData.length,
color:"primary"
},


{
title:"Annual Income",
value:
`₹ ${totalIncome.toLocaleString()}`,
color:"info"
},


{
title:"Taxable Income",
value:
`₹ ${totalTaxable.toLocaleString()}`,
color:"warning"
},


{
title:"Total TDS",
value:
`₹ ${totalTDS.toLocaleString()}`,
color:"danger"
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

data={tdsData}

/>






</Container>

);


};


export default TDSReport;
