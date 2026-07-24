import React from "react";
import {
  Row,
  Col,
  Form,
  Button,
  Card
} from "react-bootstrap";


interface ReportFiltersProps {

  showMonth?: boolean;
  showYear?: boolean;
  showDepartment?: boolean;
  showBranch?: boolean;
  showStatus?: boolean;

  month?: number;
  year?: number;
  department?: string;
  branch?: string;
  status?: string;


  onMonthChange?: (value:number)=>void;
  onYearChange?: (value:number)=>void;
  onDepartmentChange?: (value:string)=>void;
  onBranchChange?: (value:string)=>void;
  onStatusChange?: (value:string)=>void;

  onSearch?: ()=>void;

}


const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];


const YEARS = [
  2026,
  2025,
  2024,
  2023
];


const ReportFilters:React.FC<ReportFiltersProps> = ({
  
  showMonth=true,
  showYear=true,
  showDepartment=false,
  showBranch=false,
  showStatus=false,

  month,
  year,
  department,
  branch,
  status,

  onMonthChange,
  onYearChange,
  onDepartmentChange,
  onBranchChange,
  onStatusChange,

  onSearch

})=>{


return (

<Card className="shadow-sm border-0 mb-4">

<Card.Body>


<Row className="align-items-end">


{
showMonth &&

<Col md={2}>

<Form.Label>
Month
</Form.Label>


<Form.Select

value={month}

onChange={(e)=>
onMonthChange &&
onMonthChange(Number(e.target.value))
}

>

{
MONTHS.map((m,index)=>(

<option
key={index}
value={index+1}
>
{m}
</option>

))
}

</Form.Select>


</Col>

}



{
showYear &&

<Col md={2}>

<Form.Label>
Year
</Form.Label>


<Form.Select

value={year}

onChange={(e)=>
onYearChange &&
onYearChange(Number(e.target.value))
}

>

{
YEARS.map(y=>(

<option
key={y}
value={y}
>
{y}
</option>

))
}

</Form.Select>


</Col>

}



{
showDepartment &&

<Col md={2}>

<Form.Label>
Department
</Form.Label>


<Form.Select

value={department}

onChange={(e)=>
onDepartmentChange &&
onDepartmentChange(e.target.value)
}

>

<option>
All
</option>

<option>
IT
</option>

<option>
HR
</option>

<option>
Finance
</option>


</Form.Select>


</Col>

}



{
showBranch &&

<Col md={2}>

<Form.Label>
Branch
</Form.Label>


<Form.Select

value={branch}

onChange={(e)=>
onBranchChange &&
onBranchChange(e.target.value)
}

>

<option>
All
</option>

<option>
Hyderabad
</option>

<option>
Bangalore
</option>

<option>
Chennai
</option>


</Form.Select>


</Col>

}



{
showStatus &&

<Col md={2}>

<Form.Label>
Status
</Form.Label>


<Form.Select

value={status}

onChange={(e)=>
onStatusChange &&
onStatusChange(e.target.value)
}

>

<option>
All
</option>

<option>
Active
</option>

<option>
Inactive
</option>


</Form.Select>


</Col>

}



<Col md={2}>

<Button

variant="primary"

className="w-100"

onClick={onSearch}

>

View Report

</Button>


</Col>



</Row>


</Card.Body>

</Card>


);


};


export default ReportFilters;
