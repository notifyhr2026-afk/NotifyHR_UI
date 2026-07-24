import React from "react";
import {
  Row,
  Col,
  Card
} from "react-bootstrap";


interface SummaryCard {

  title: string;

  value: string | number;

  color?: 
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "secondary";

  icon?: React.ReactNode;

}


interface ReportSummaryCardsProps {

  cards: SummaryCard[];

}


const ReportSummaryCards:React.FC<ReportSummaryCardsProps> = ({
  cards
}) => {


return (

<Row className="mb-4">


{
cards.map((card,index)=>(


<Col
key={index}
md={3}
sm={6}
xs={12}
className="mb-3"
>


<Card

className="shadow-sm border-0 h-100"

bg={card.color || "primary"}

text={
  card.color === "warning"
  ? "dark"
  : "white"
}

>


<Card.Body>


<div className="d-flex justify-content-between align-items-center">


<div>

<h6 className="mb-2">
{card.title}
</h6>


<h3 className="fw-bold mb-0">
{card.value}
</h3>


</div>


{
card.icon &&

<div>

{card.icon}

</div>

}


</div>


</Card.Body>


</Card>


</Col>


))

}


</Row>


);


};


export default ReportSummaryCards;
