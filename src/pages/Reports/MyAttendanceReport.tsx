import React from "react";

import { Container } from "react-bootstrap";

import ReportHeader from "./components/ReportHeader";
import ReportFilters from "./components/ReportFilters";
import ReportSummaryCards from "./components/ReportSummaryCards";
import ReportTable from "./components/ReportTable";
import PrintButton from "./components/PrintButton";

import { generatePDF } from "./components/PDFGenerator";
import { exportExcel } from "./components/ExcelExporter";



interface Attendance {


date:string;

day:string;

checkIn:string;

checkOut:string;

workingHours:string;

status:string;


}



const attendanceData:Attendance[]=[


{
date:"2026-07-01",
day:"Wednesday",
checkIn:"09:15 AM",
checkOut:"06:10 PM",
workingHours:"8h 55m",
status:"Present"
},


{
date:"2026-07-02",
day:"Thursday",
checkIn:"09:25 AM",
checkOut:"06:05 PM",
workingHours:"8h 40m",
status:"Present"
},


{
date:"2026-07-03",
day:"Friday",
checkIn:"-",
checkOut:"-",
workingHours:"0",
status:"Leave"
},


{
date:"2026-07-04",
day:"Saturday",
checkIn:"-",
checkOut:"-",
workingHours:"0",
status:"Absent"
}


];





const MyAttendanceReport:React.FC=()=>{


const columns=[


{
key:"date",
label:"Date"
},

{
key:"day",
label:"Day"
},

{
key:"checkIn",
label:"Check In"
},

{
key:"checkOut",
label:"Check Out"
},

{
key:"workingHours",
label:"Working Hours"
},

{
key:"status",
label:"Status"
}


];




const present =
attendanceData.filter(
x=>x.status==="Present"
).length;



const leave =
attendanceData.filter(
x=>x.status==="Leave"
).length;



const absent =
attendanceData.filter(
x=>x.status==="Absent"
).length;





const downloadPDF=()=>{


generatePDF({

title:"My Attendance Report",

organizationName:"HRMS Organization",

columns,

data:attendanceData,

fileName:"My_Attendance"

});


};





const downloadExcel=()=>{


exportExcel({

title:"My Attendance Report",

columns,

data:attendanceData,

fileName:"My_Attendance"

});


};




return (

<Container className="mt-4">


<ReportHeader

title="My Attendance"

subTitle="Employee attendance details"

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
title:"Present",
value:present,
color:"success"
},

{
title:"Leave",
value:leave,
color:"warning"
},

{
title:"Absent",
value:absent,
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

data={attendanceData}

/>



</Container>

);


};


export default MyAttendanceReport;
