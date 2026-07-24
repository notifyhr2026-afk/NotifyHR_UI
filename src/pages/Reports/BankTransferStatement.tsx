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

interface BankTransfer {

  employeeId:string;

  employeeName:string;

  department:string;

  bankName:string;

  accountNumber:string;

  ifscCode:string;

  netSalary:number;

  transferStatus:string;

}


// ================= STATIC DATA =================


const bankTransferData:BankTransfer[]=[


{
 employeeId:"EMP001",
 employeeName:"John Smith",
 department:"IT",
 bankName:"HDFC Bank",
 accountNumber:"XXXXXX4589",
 ifscCode:"HDFC0001234",
 netSalary:65000,
 transferStatus:"Processed"
},


{
 employeeId:"EMP002",
 employeeName:"Rahul Kumar",
 department:"HR",
 bankName:"ICICI Bank",
 accountNumber:"XXXXXX7845",
 ifscCode:"ICIC0002345",
 netSalary:52000,
 transferStatus:"Processed"
},


{
 employeeId:"EMP003",
 employeeName:"Priya Sharma",
 department:"Finance",
 bankName:"State Bank of India",
 accountNumber:"XXXXXX9654",
 ifscCode:"SBIN0003456",
 netSalary:58000,
 transferStatus:"Pending"
},


{
 employeeId:"EMP004",
 employeeName:"Arun Kumar",
 department:"Admin",
 bankName:"Axis Bank",
 accountNumber:"XXXXXX7841",
 ifscCode:"UTIB0004567",
 netSalary:45000,
 transferStatus:"Processed"
}


];



// ================= COMPONENT =================


const BankTransferStatement:React.FC=()=>{


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
 key:"bankName",
 label:"Bank Name"
},


{
 key:"accountNumber",
 label:"Account Number"
},


{
 key:"ifscCode",
 label:"IFSC Code"
},


{
 key:"netSalary",
 label:"Net Salary"
},


{
 key:"transferStatus",
 label:"Transfer Status"
}


];





const totalSalary =
bankTransferData.reduce(

(sum,x)=>

sum+x.netSalary,

0

);



const processedCount =
bankTransferData.filter(

x=>x.transferStatus==="Processed"

).length;



const pendingCount =
bankTransferData.filter(

x=>x.transferStatus==="Pending"

).length;





const downloadPDF=()=>{


generatePDF({

title:"Bank Transfer Statement",

organizationName:"HRMS Organization",

columns,

data:bankTransferData,

fileName:"Bank_Transfer_Statement"

});


};






const downloadExcel=()=>{


exportExcel({

title:"Bank Transfer Statement",

columns,

data:bankTransferData,

fileName:"Bank_Transfer_Statement"

});


};







return (

<Container className="mt-4">



<ReportHeader

title="Bank Transfer Statement"

subTitle="Employee salary bank transfer details"

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
 value:bankTransferData.length,
 color:"primary"
},


{
 title:"Total Transfer Amount",
 value:
 `$ ${totalSalary.toLocaleString()}`,
 color:"success"
},


{
 title:"Processed",
 value:processedCount,
 color:"info"
},


{
 title:"Pending",
 value:pendingCount,
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

data={bankTransferData}

/>






</Container>

);


};


export default BankTransferStatement;
