import React from "react";

import {
  Container,
  Badge
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

interface LeaveHistory {

  leaveId:string;

  employeeId:string;

  employeeName:string;

  department:string;

  leaveType:string;

  fromDate:string;

  toDate:string;

  totalDays:number;

  reason:string;

  status:string;

  approvedBy:string;

}


// ================= STATIC DATA =================


const leaveHistoryData:LeaveHistory[]=[


{
 leaveId:"LV001",
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 leaveType:"Casual Leave",
 fromDate:"2026-07-05",
 toDate:"2026-07-06",
 totalDays:2,
 reason:"Personal work",
 status:"Approved",
 approvedBy:"HR Manager"
},


{
 leaveId:"LV002",
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 leaveType:"Sick Leave",
 fromDate:"2026-07-10",
 toDate:"2026-07-12",
 totalDays:3,
 reason:"Medical issue",
 status:"Approved",
 approvedBy:"HR Manager"
},


{
 leaveId:"LV003",
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 leaveType:"Earned Leave",
 fromDate:"2026-07-15",
 toDate:"2026-07-20",
 totalDays:6,
 reason:"Family function",
 status:"Pending",
 approvedBy:"-"
},


{
 leaveId:"LV004",
 employeeId:"EMP004",
 employeeName:"Arun Kumar",
 department:"Admin",
 leaveType:"Casual Leave",
 fromDate:"2026-07-22",
 toDate:"2026-07-22",
 totalDays:1,
 reason:"Personal work",
 status:"Rejected",
 approvedBy:"HR Manager"
}


];


// ================= COMPONENT =================


const LeaveHistoryReport:React.FC=()=>{


const columns=[


{
key:"leaveId",
label:"Leave ID"
},


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
key:"fromDate",
label:"From Date"
},


{
key:"toDate",
label:"To Date"
},


{
key:"totalDays",
label:"Days"
},


{
key:"reason",
label:"Reason"
},


{
key:"status",
label:"Status"
},


{
key:"approvedBy",
label:"Approved By"
}


];





const approved =
leaveHistoryData.filter(
x=>x.status==="Approved"
).length;



const pending =
leaveHistoryData.filter(
x=>x.status==="Pending"
).length;



const rejected =
leaveHistoryData.filter(
x=>x.status==="Rejected"
).length;



const totalDays =
leaveHistoryData.reduce(

(sum,x)=>
sum+x.totalDays,

0

);






const downloadPDF=()=>{


generatePDF({

title:"Leave History Report",

organizationName:"HRMS Organization",

columns,

data:leaveHistoryData,

fileName:"Leave_History_Report"

});


};







const downloadExcel=()=>{


exportExcel({

title:"Leave History Report",

columns,

data:leaveHistoryData,

fileName:"Leave_History_Report"

});


};






return (

<Container className="mt-4">


<ReportHeader

title="Leave History Report"

subTitle="Employee leave application and approval history"

organizationName="HRMS Organization"

/>






<ReportFilters

showMonth

showYear

showDepartment

onSearch={()=>{}}

/>







<ReportSummaryCards


cards={[


{
title:"Total Requests",
value:leaveHistoryData.length,
color:"primary"
},


{
title:"Approved",
value:approved,
color:"success"
},


{
title:"Pending",
value:pending,
color:"warning"
},


{
title:"Total Leave Days",
value:totalDays,
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

data={leaveHistoryData}

/>






</Container>

);


};


export default LeaveHistoryReport;
