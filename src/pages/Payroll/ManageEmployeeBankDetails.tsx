import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  Toast,
  ToastContainer,
  Row,
  Col,
} from "react-bootstrap";

import {
  
  BsPlus,
  
} from "react-icons/bs";

import employeeBankDetailsService from "../../services/employeeBankDetailsService";
import LoggedInUser from "../../types/LoggedInUser";


const Icon = (Component:any, props:any={}) => (
  <Component {...props}/>
);


interface EmployeeBankDetails {

  employeeBankDetailID:number;

  employeeID:number;

  accountHolderName:string;

  bankName:string;

  branchName:string;

  accountNumber:string;

  ifscCode:string;

  accountType:string;

  upiid:string;

  isPrimary:boolean;

  isActive:boolean;


  isVerified:boolean;

  verificationStatus:string;

  verificationMethod:string;

  verificationRemarks:string;

}



const ManageEmployeeBankDetails:React.FC =()=>{


const userString = localStorage.getItem("user");

const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeID = user?.employeeID;
  const organizationID: number | undefined = user?.organizationID;



const [banks,setBanks]=
useState<EmployeeBankDetails[]>([]);


const [showModal,setShowModal]=
useState(false);


const [validated,setValidated]=
useState(false);


const [editData,setEditData]=
useState<EmployeeBankDetails|null>(null);



const [toast,setToast]=useState({
 show:false,
 message:"",
 variant:"success"
});



const [formData,setFormData]=
useState<EmployeeBankDetails>({

employeeBankDetailID:0,

employeeID:employeeID,

accountHolderName:"",

bankName:"",

branchName:"",

accountNumber:"",

ifscCode:"",

accountType:"Salary",

upiid:"",

isPrimary:true,

isActive:true,

isVerified:false,

verificationStatus:"Pending",

verificationMethod:"",

verificationRemarks:""

});




useEffect(()=>{
 loadBanks();
},[]);



const loadBanks=async()=>{

try{

const res =
await employeeBankDetailsService
.getEmployeeBankDetails(
 organizationID!, 
 employeeID
);


const mapped =
(res||[]).map((x:any)=>({

employeeBankDetailID:
x.EmployeeBankDetailID,

employeeID:x.EmployeeID,

accountHolderName:
x.AccountHolderName,

bankName:x.BankName,

branchName:x.BranchName,

accountNumber:
x.AccountNumber,

ifscCode:x.IFSCCode,

accountType:
x.AccountType,

upiid:x.UPIID,

isPrimary:x.IsPrimary,

isActive:x.IsActive,

isVerified:x.IsVerified,

verificationStatus:
x.VerificationStatus,

verificationMethod:
x.VerificationMethod,

verificationRemarks:
x.VerificationRemarks

}));


setBanks(mapped);


}
catch(e){
console.log(e);
}

};



const handleChange=(e:any)=>{

const {name,value,type}=e.target;


setFormData(prev=>({

...prev,

[name]:
type==="checkbox"
? e.target.checked
:value

}));

};



const openAdd=()=>{

setEditData(null);

setFormData({

employeeBankDetailID:0,

employeeID,

accountHolderName:"",

bankName:"",

branchName:"",

accountNumber:"",

ifscCode:"",

accountType:"Salary",

upiid:"",

isPrimary:true,

isActive:true,

isVerified:false,

verificationStatus:"Pending",

verificationMethod:"",

verificationRemarks:""

});


setShowModal(true);

};



const openEdit=(row:any)=>{

setEditData(row);

setFormData(row);

setShowModal(true);

};




const save=async(
e:React.FormEvent<HTMLFormElement>
)=>{


e.preventDefault();


const payload={

...formData,

organizationID,

createdBy:user?.userID ?? 0

};



const res =
await employeeBankDetailsService
.postEmployeeBankDetails(payload);



if(res?.Value===1 ||
res?.value===1)
{

setToast({
show:true,
message:"Bank details saved",
variant:"success"
});


setShowModal(false);

loadBanks();

}

};



const remove=async(id:number)=>{


if(!window.confirm("Delete bank details?"))
return;


const res =
await employeeBankDetailsService
.deleteEmployeeBankDetails(
 id,
 user?.userID ??0
);



const result =
Array.isArray(res)?res[0]:res;



if(result?.Value===1 ||
result?.value===1)
{

setToast({
show:true,
message:"Deleted successfully",
variant:"success"
});


loadBanks();

}


};




return (

<div className="Container">


<Row className="mb-4">

<Col>
<h3>
Employee Bank Details
</h3>
</Col>

<Col md={4}
className="text-end">

<Button onClick={openAdd}>

{Icon(BsPlus,{
className:"me-1"
})}

Add Bank

</Button>

</Col>

</Row>




<Table className="table-hover table-dark-custom">

<thead>

<tr>

<th>Bank</th>
<th>Account</th>
<th>IFSC</th>
<th>Verification</th>
<th>Status</th>
<th>Actions</th>

</tr>

</thead>


<tbody>


{
banks.length>0 ?

banks.map(x=>(

<tr key={x.employeeBankDetailID}>


<td>
{x.bankName}
</td>


<td>
{x.accountNumber}
</td>


<td>
{x.ifscCode}
</td>


<td>

<Badge bg={
x.isVerified?
"success":"warning"
}>

{x.verificationStatus}

</Badge>

</td>


<td>

<Badge bg={
x.isActive?
"success":"danger"
}>

{
x.isActive?
"Active":"Inactive"
}

</Badge>

</td>



<td>

<Button
size="sm"
variant="outline-primary"
onClick={()=>openEdit(x)}
>

Edit

</Button>


<Button
size="sm"
variant="outline-danger"
className="ms-2"
onClick={()=>remove(
x.employeeBankDetailID
)}
>

Delete

</Button>


</td>



</tr>

))

:

<tr>
<td colSpan={6}
className="text-center">

No bank details

</td>
</tr>


}



</tbody>

</Table>





<Modal
show={showModal}
onHide={()=>setShowModal(false)}
centered
>


<Form onSubmit={save}>


<Modal.Header closeButton>

<Modal.Title>

{
editData?
"Edit Bank Details":
"Add Bank Details"
}

</Modal.Title>

</Modal.Header>



<Modal.Body>


<Form.Group className="mb-2">

<Form.Label>
Account Holder
</Form.Label>


<Form.Control

name="accountHolderName"

value={formData.accountHolderName}

onChange={handleChange}

/>

</Form.Group>



<Form.Group className="mb-2">

<Form.Label>
Bank Name
</Form.Label>

<Form.Control

name="bankName"

value={formData.bankName}

onChange={handleChange}

/>

</Form.Group>




<Row>

<Col>

<Form.Control

placeholder="Account Number"

name="accountNumber"

value={formData.accountNumber}

onChange={handleChange}

/>

</Col>


<Col>

<Form.Control

placeholder="IFSC"

name="ifscCode"

value={formData.ifscCode}

onChange={handleChange}

/>


</Col>

</Row>


<Form.Check

type="switch"

label="Active"

name="isActive"

checked={formData.isActive}

onChange={handleChange}

/>



</Modal.Body>



<Modal.Footer>


<Button
variant="secondary"
onClick={()=>setShowModal(false)}
>
Cancel
</Button>


<Button
type="submit"
>
Save
</Button>


</Modal.Footer>


</Form>


</Modal>





<ToastContainer position="top-end">

<Toast

show={toast.show}

bg={toast.variant}

delay={3000}

autohide

onClose={()=>
setToast(p=>({...p,show:false}))
}

>

<Toast.Body className="text-white">

{toast.message}

</Toast.Body>

</Toast>


</ToastContainer>



</div>

);

};


export default ManageEmployeeBankDetails;