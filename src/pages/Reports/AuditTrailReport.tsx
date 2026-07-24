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

interface AuditTrail {

  auditId:string;

  userName:string;

  role:string;

  module:string;

  action:string;

  description:string;

  ipAddress:string;

  createdDate:string;

}



// ================= STATIC DATA =================


const auditData:AuditTrail[]=[


{
 auditId:"AUD001",
 userName:"Admin User",
 role:"OrgAdmin",
 module:"Employee",
 action:"Create",
 description:"Created new employee record EMP005",
 ipAddress:"192.168.1.10",
 createdDate:"2026-07-01 10:30 AM"
},


{
 auditId:"AUD002",
 userName:"HR Manager",
 role:"HRManager",
 module:"Leave",
 action:"Update",
 description:"Updated leave policy",
 ipAddress:"192.168.1.15",
 createdDate:"2026-07-02 11:45 AM"
},


{
 auditId:"AUD003",
 userName:"Payroll User",
 role:"PayrollManager",
 module:"Salary",
 action:"Update",
 description:"Processed monthly payroll",
 ipAddress:"192.168.1.20",
 createdDate:"2026-07-03 05:15 PM"
},


{
 auditId:"AUD004",
 userName:"Admin User",
 role:"OrgAdmin",
 module:"User Management",
 action:"Delete",
 description:"Removed inactive user",
 ipAddress:"192.168.1.10",
 createdDate:"2026-07-04 09:20 AM"
},


{
 auditId:"AUD005",
 userName:"John Smith",
 role:"Employee",
 module:"Login",
 action:"Login",
 description:"Employee login successful",
 ipAddress:"192.168.1.50",
 createdDate:"2026-07-05 08:10 AM"
}


];



// ================= COMPONENT =================


const AuditTrailReport:React.FC=()=>{



const columns=[


{
key:"auditId",
label:"Audit ID"
},


{
key:"userName",
label:"User"
},


{
key:"role",
label:"Role"
},


{
key:"module",
label:"Module"
},


{
key:"action",
label:"Action"
},


{
key:"description",
label:"Description"
},


{
key:"ipAddress",
label:"IP Address"
},


{
key:"createdDate",
label:"Date & Time"
}


];





const createCount =
auditData.filter(
x=>x.action==="Create"
).length;



const updateCount =
auditData.filter(
x=>x.action==="Update"
).length;



const deleteCount =
auditData.filter(
x=>x.action==="Delete"
).length;



const loginCount =
auditData.filter(
x=>x.action==="Login"
).length;





const downloadPDF=()=>{


generatePDF({

title:"Audit Trail Report",

organizationName:"HRMS Organization",

columns,

data:auditData,

fileName:"Audit_Trail_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Audit Trail Report",

columns,

data:auditData,

fileName:"Audit_Trail_Report"

});


};







return (

<Container className="mt-4">


<ReportHeader

title="Audit Trail Report"

subTitle="System activity and user change history"

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
title:"Total Activities",
value:auditData.length,
color:"primary"
},


{
title:"Create Actions",
value:createCount,
color:"success"
},


{
title:"Update Actions",
value:updateCount,
color:"warning"
},


{
title:"Delete/Login",
value:
deleteCount + loginCount,
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

data={auditData}

/>





</Container>

);


};


export default AuditTrailReport;
