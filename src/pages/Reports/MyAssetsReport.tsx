import React from "react";

import {
  Container
} from "react-bootstrap";

import ReportHeader from "./components/ReportHeader";
import ReportSummaryCards from "./components/ReportSummaryCards";
import ReportTable from "./components/ReportTable";
import PrintButton from "./components/PrintButton";

import { generatePDF } from "./components/PDFGenerator";
import { exportExcel } from "./components/ExcelExporter";


// ================= TYPES =================

interface MyAsset {

  assetId:string;

  assetName:string;

  category:string;

  serialNumber:string;

  assignedDate:string;

  warrantyExpiry:string;

  condition:string;

  status:string;

}


// ================= STATIC DATA =================


const myAssetsData:MyAsset[]=[


{
 assetId:"AST001",
 assetName:"Dell Latitude Laptop",
 category:"Laptop",
 serialNumber:"DL-458921",
 assignedDate:"2025-01-15",
 warrantyExpiry:"2028-01-15",
 condition:"Good",
 status:"Assigned"
},


{
 assetId:"AST002",
 assetName:"Samsung Monitor",
 category:"Monitor",
 serialNumber:"SM-785421",
 assignedDate:"2025-02-10",
 warrantyExpiry:"2027-02-10",
 condition:"Good",
 status:"Assigned"
},


{
 assetId:"AST003",
 assetName:"Office Headset",
 category:"Accessory",
 serialNumber:"HS-963258",
 assignedDate:"2025-03-05",
 warrantyExpiry:"2026-03-05",
 condition:"Damaged",
 status:"Replacement Required"
}


];



// ================= COMPONENT =================


const MyAssetsReport:React.FC=()=>{


const columns=[


{
key:"assetId",
label:"Asset ID"
},


{
key:"assetName",
label:"Asset Name"
},


{
key:"category",
label:"Category"
},


{
key:"serialNumber",
label:"Serial Number"
},


{
key:"assignedDate",
label:"Assigned Date"
},


{
key:"warrantyExpiry",
label:"Warranty Expiry"
},


{
key:"condition",
label:"Condition"
},


{
key:"status",
label:"Status"
}


];





const totalAssets =
myAssetsData.length;



const activeAssets =
myAssetsData.filter(
x=>x.status==="Assigned"
).length;



const issueAssets =
myAssetsData.filter(
x=>x.status!=="Assigned"
).length;





const downloadPDF=()=>{


generatePDF({

title:"My Assets Report",

organizationName:"HRMS Organization",

columns,

data:myAssetsData,

fileName:"My_Assets_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"My Assets Report",

columns,

data:myAssetsData,

fileName:"My_Assets_Report"

});


};





return (

<Container className="mt-4">


<ReportHeader

title="My Assets"

subTitle="Employee assigned company assets"

organizationName="HRMS Organization"

/>





<ReportSummaryCards

cards={[


{
title:"Total Assets",
value:totalAssets,
color:"primary"
},


{
title:"Assigned",
value:activeAssets,
color:"success"
},


{
title:"Issues",
value:issueAssets,
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

data={myAssetsData}

/>






</Container>

);


};


export default MyAssetsReport;
