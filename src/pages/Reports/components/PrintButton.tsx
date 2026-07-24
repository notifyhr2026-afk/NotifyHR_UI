import React from "react";
import { Button } from "react-bootstrap";


interface PrintButtonProps {

  label?: string;

  variant?:
    | "primary"
    | "success"
    | "secondary"
    | "dark";

  className?: string;

}


const PrintButton: React.FC<PrintButtonProps> = ({

  label = "Print",

  variant = "secondary",

  className = ""

}) => {


  const handlePrint = () => {

    window.print();

  };


  return (

    <Button

      variant={variant}

      className={className}

      onClick={handlePrint}

    >

      🖨 {label}

    </Button>

  );


};


export default PrintButton;
