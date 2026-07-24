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

interface LeaveBalance {

  employeeId:string;

  employeeName:string;

  department:string;

  leaveType:string;

  openingBalance:number;

  leaveTaken:number;

  availableBalance:number;

}



// ================= STATIC DATA =================


const leaveData:LeaveBalance[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 leaveType:"Casual Leave",
 openingBalance:12,
 leaveTaken:4,
 availableBalance:8
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 leaveType:"Sick Leave",
 openingBalance:10,
 leaveTaken:2,
 availableBalance:8
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 leaveType:"Earned Leave",
 openingBalance:18,
 leaveTaken:7,
 availableBalance:11
},


{
 employeeId:"EMP004",
 employeeName:"Arun Kumar",
 department:"IT",
 leaveType:"Casual Leave",
 openingBalance:12,
 leaveTaken:10,
 availableBalance:2
}


];



// ================= COMPONENT =================


const LeaveBalanceReport:React.FC=()=>{


const [department,setDepartment]=useState("All");



const filteredData =

department==="All"

?

leaveData

:

leaveData.filter(

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
key:"leaveType",
label:"Leave Type"
},


{
key:"openingBalance",
label:"Opening Balance"
},


{
key:"leaveTaken",
label:"Leave Used"
},


{
key:"availableBalance",
label:"Available Balance"
}


];





const totalAvailable = filteredData.reduce(

(sum,x)=>

sum+x.availableBalance,

0

);



const totalUsed = filteredData.reduce(

(sum,x)=>

sum+x.leaveTaken,

0

);



const downloadPDF=()=>{


generatePDF({

title:"Leave Balance Report",

organizationName:"HRMS Organization",

columns,

data:filteredData,

fileName:"Leave_Balance_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Leave Balance Report",

columns,

data:filteredData,

fileName:"Leave_Balance_Report"

});


};






return (

<Container className="mt-4">



<ReportHeader

title="Leave Balance Report"

subTitle="Employee leave entitlement and utilization"

organizationName="HRMS Organization"

/>





<ReportFilters


showMonth={false}

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
value:filteredData.length,
color:"primary"
},


{
title:"Leave Used",
value:totalUsed,
color:"warning"
},


{
title:"Available Leave",
value:totalAvailable,
color:"success"
},


{
title:"Leave Types",
value:
new Set(
filteredData.map(
x=>x.leaveType
)
).size,
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

data={filteredData}

/>






</Container>

);


};


export default LeaveBalanceReport;
