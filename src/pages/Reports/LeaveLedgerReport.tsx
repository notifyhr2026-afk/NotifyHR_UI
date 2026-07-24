import React from "react";

import { Container } from "react-bootstrap";

import ReportHeader from "./components/ReportHeader";
import ReportFilters from "./components/ReportFilters";
import ReportSummaryCards from "./components/ReportSummaryCards";
import ReportTable from "./components/ReportTable";
import PrintButton from "./components/PrintButton";

import { generatePDF } from "./components/PDFGenerator";
import { exportExcel } from "./components/ExcelExporter";



interface LeaveLedger {

  date:string;

  leaveType:string;

  transaction:string;

  credit:number;

  debit:number;

  balance:number;

  remarks:string;

}



const leaveLedgerData:LeaveLedger[]=[


{
 date:"2026-01-01",
 leaveType:"Casual Leave",
 transaction:"Opening Balance",
 credit:12,
 debit:0,
 balance:12,
 remarks:"Year opening"
},


{
 date:"2026-02-10",
 leaveType:"Casual Leave",
 transaction:"Leave Applied",
 credit:0,
 debit:2,
 balance:10,
 remarks:"Personal work"
},


{
 date:"2026-03-15",
 leaveType:"Sick Leave",
 transaction:"Leave Credited",
 credit:10,
 debit:0,
 balance:10,
 remarks:"Monthly accrual"
},


{
 date:"2026-04-05",
 leaveType:"Sick Leave",
 transaction:"Leave Applied",
 credit:0,
 debit:1,
 balance:9,
 remarks:"Medical reason"
}


];




const LeaveLedgerReport:React.FC=()=>{


const columns=[

{
key:"date",
label:"Date"
},

{
key:"leaveType",
label:"Leave Type"
},

{
key:"transaction",
label:"Transaction"
},

{
key:"credit",
label:"Credit"
},

{
key:"debit",
label:"Debit"
},

{
key:"balance",
label:"Balance"
},

{
key:"remarks",
label:"Remarks"
}

];




const totalCredit =
leaveLedgerData.reduce(
(sum,x)=>sum+x.credit,
0
);


const totalDebit =
leaveLedgerData.reduce(
(sum,x)=>sum+x.debit,
0
);



const downloadPDF=()=>{


generatePDF({

title:"Leave Ledger Report",

organizationName:"HRMS Organization",

columns,

data:leaveLedgerData,

fileName:"Leave_Ledger"

});


};



const downloadExcel=()=>{


exportExcel({

title:"Leave Ledger Report",

columns,

data:leaveLedgerData,

fileName:"Leave_Ledger"

});


};




return (

<Container className="mt-4">


<ReportHeader

title="Leave Ledger"

subTitle="Employee leave credit and debit history"

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
title:"Total Credit",
value:totalCredit,
color:"success"
},

{
title:"Total Used",
value:totalDebit,
color:"danger"
},

{
title:"Current Balance",
value:
leaveLedgerData[
leaveLedgerData.length-1
].balance,
color:"primary"
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

data={leaveLedgerData}

/>



</Container>

);


};


export default LeaveLedgerReport;
