import React from "react";

import {
  Container,
  Badge
} from "react-bootstrap";

import ReportHeader from "./components/ReportHeader";
import ReportFilters from "./components/ReportFilters";
import ReportSummaryCards from "./components/ReportSummaryCards";
import ReportTable from "./components/ReportTable";
import PrintButton from "./components/PrintButton";

import { generatePDF } from "./components/PDFGenerator";
import { exportExcel } from "./components/ExcelExporter";


// ================= TYPES =================

interface AssetRegister {

  assetId:string;

  assetName:string;

  category:string;

  employeeId:string;

  employeeName:string;

  department:string;

  purchaseDate:string;

  purchaseValue:number;

  warrantyExpiry:string;

  status:string;

}


// ================= STATIC DATA =================


const assetData:AssetRegister[]=[

{
 assetId:"AST001",
 assetName:"Dell Latitude Laptop",
 category:"Laptop",
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 purchaseDate:"2025-01-10",
 purchaseValue:65000,
 warrantyExpiry:"2028-01-10",
 status:"Assigned"
},


{
 assetId:"AST002",
 assetName:"Samsung Monitor",
 category:"Monitor",
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 purchaseDate:"2025-02-15",
 purchaseValue:18000,
 warrantyExpiry:"2027-02-15",
 status:"Assigned"
},


{
 assetId:"AST003",
 assetName:"iPhone 15",
 category:"Mobile",
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 purchaseDate:"2025-03-20",
 purchaseValue:70000,
 warrantyExpiry:"2027-03-20",
 status:"Assigned"
},


{
 assetId:"AST004",
 assetName:"HP Printer",
 category:"Printer",
 employeeId:"",
 employeeName:"-",
 department:"Administration",
 purchaseDate:"2024-12-05",
 purchaseValue:25000,
 warrantyExpiry:"2027-12-05",
 status:"Available"
},


{
 assetId:"AST005",
 assetName:"Office Chair",
 category:"Furniture",
 employeeId:"",
 employeeName:"-",
 department:"Administration",
 purchaseDate:"2025-04-01",
 purchaseValue:8000,
 warrantyExpiry:"2026-04-01",
 status:"Returned"
}

];




// ================= COMPONENT =================


const AssetRegisterReport:React.FC=()=>{


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
 key:"employeeId",
 label:"Employee ID"
},


{
 key:"employeeName",
 label:"Assigned Employee"
},


{
 key:"department",
 label:"Department"
},


{
 key:"purchaseDate",
 label:"Purchase Date"
},


{
 key:"purchaseValue",
 label:"Purchase Value"
},


{
 key:"warrantyExpiry",
 label:"Warranty Expiry"
},


{
 key:"status",
 label:"Status"
}


];





const totalAssets = assetData.length;


const assignedAssets =
assetData.filter(
x=>x.status==="Assigned"
).length;


const availableAssets =
assetData.filter(
x=>x.status==="Available"
).length;



const totalValue =
assetData.reduce(

(sum,x)=>

sum+x.purchaseValue,

0

);





const downloadPDF=()=>{


generatePDF({

title:"Asset Register Report",

organizationName:"HRMS Organization",

columns,

data:assetData,

fileName:"Asset_Register_Report"

});


};





const downloadExcel=()=>{


exportExcel({

title:"Asset Register Report",

columns,

data:assetData,

fileName:"Asset_Register_Report"

});


};





return (

<Container className="mt-4">


<ReportHeader

title="Asset Register Report"

subTitle="Company asset inventory and employee allocation"

organizationName="HRMS Organization"

/>





<ReportFilters

showMonth={false}

showYear={false}

showDepartment

onSearch={()=>{}}

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
value:assignedAssets,
color:"success"
},


{
title:"Available",
value:availableAssets,
color:"warning"
},


{
title:"Asset Value",
value:`₹ ${totalValue.toLocaleString()}`,
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

data={assetData}

/>



</Container>

);

};


export default AssetRegisterReport;
