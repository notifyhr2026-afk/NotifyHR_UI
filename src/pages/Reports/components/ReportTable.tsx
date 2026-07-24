import React from "react";
import {
  Table,
  Spinner,
  Alert
} from "react-bootstrap";


export interface TableColumn<T> {

  key: keyof T | string;

  label: string;

  render?: (
    row: T
  ) => React.ReactNode;

}


interface ReportTableProps<T> {

  columns: TableColumn<T>[];

  data: T[];

  loading?: boolean;

  striped?: boolean;

  bordered?: boolean;

  hover?: boolean;

}


const ReportTable = <T extends object>({

  columns,

  data,

  loading = false,

  striped = true,

  bordered = true,

  hover = true

}: ReportTableProps<T>) => {


if (loading) {

return (

<div className="text-center py-5">

<Spinner animation="border"/>

</div>

);

}



if (!data || data.length === 0) {

return (

<Alert
variant="warning"
className="text-center"
>

No records found

</Alert>

);

}



return (

<div className="table-responsive">


<Table

striped={striped}

bordered={bordered}

hover={hover}

>

<thead className="table-primary">

<tr>


{
columns.map((column,index)=>(


<th key={index}>

{column.label}

</th>


))

}


</tr>

</thead>



<tbody>


{
data.map((row,rowIndex)=>(


<tr key={rowIndex}>


{
columns.map((column,colIndex)=>(


<td key={colIndex}>


{
column.render

?

column.render(row)

:

String(
(row as any)[column.key]
)

}


</td>


))


}


</tr>


))

}


</tbody>


</Table>


</div>


);


};


export default ReportTable;
