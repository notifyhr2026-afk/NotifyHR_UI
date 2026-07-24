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

interface Organization {

  organizationId:string;

  organizationName:string;

  branch:string;

  location:string;

  departments:number;

  employees:number;

  contactEmail:string;

  status:string;

}



// ================= STATIC DATA =================


const organizations:Organization[]=[


{
 organizationId:"ORG001",
 organizationName:"ABC Technologies Pvt Ltd",
 branch:"Hyderabad",
 location:"Telangana",
 departments:8,
 employees:250,
 contactEmail:"admin@abc.com",
 status:"Active"
},


{
 organizationId:"ORG002",
 organizationName:"ABC Technologies Pvt Ltd",
 branch:"Bangalore",
 location:"Karnataka",
 departments:6,
 employees:180,
 contactEmail:"blr@abc.com",
 status:"Active"
},


{
 organizationId:"ORG003",
 organizationName:"ABC Technologies Pvt Ltd",
 branch:"Chennai",
 location:"Tamil Nadu",
 departments:5,
 employees:120,
 contactEmail:"chn@abc.com",
 status:"Inactive"
}


];




// ================= COMPONENT =================


const OrganizationMasterReport:React.FC =()=>{


const [status,setStatus]=useState("All");



const filteredData =
status==="All"
?
organizations
:
organizations.filter(
 x=>x.status===status
);



const columns=[


{
 key:"organizationId",
 label:"Organization ID"
},


{
 key:"organizationName",
 label:"Organization Name"
},


{
 key:"branch",
 label:"Branch"
},


{
 key:"location",
 label:"Location"
},


{
 key:"departments",
 label:"Departments"
},


{
 key:"employees",
 label:"Employees"
},


{
 key:"contactEmail",
 label:"Email"
},


{
 key:"status",
 label:"Status",

 render:(row:Organization)=>(

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

 title:"Organization Master Report",

 organizationName:"HRMS",

 columns,

 data:filteredData,

 fileName:"Organization_Master_Report"

});


};





const downloadExcel=()=>{


exportExcel({

 title:"Organization Master Report",

 columns,

 data:filteredData,

 fileName:"Organization_Master_Report"

});


};




return (

<Container className="mt-4">



<ReportHeader

title="Organization Master Report"

subTitle="Organization, branches and business units"

organizationName="HRMS Organization"

/>




<ReportFilters


showMonth={false}

showYear={false}

showStatus


status={status}


onStatusChange={setStatus}


onSearch={()=>{}}


/>





<ReportSummaryCards


cards={[


{
 title:"Total Branches",
 value:organizations.length,
 color:"primary"
},


{
 title:"Active Branches",
 value:
 organizations.filter(
 x=>x.status==="Active"
 ).length,
 color:"success"
},


{
 title:"Total Employees",
 value:
 organizations.reduce(
 (a,b)=>a+b.employees,
 0
 ),
 color:"info"
},


{
 title:"Departments",
 value:
 organizations.reduce(
 (a,b)=>a+b.departments,
 0
 ),
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

data={filteredData}

/>





</Container>

);


};



export default OrganizationMasterReport;
