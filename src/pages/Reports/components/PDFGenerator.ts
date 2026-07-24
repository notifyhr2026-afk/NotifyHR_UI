import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface PDFColumn<T> {

  key: keyof T | string;

  label: string;

}


interface GeneratePDFProps<T> {

  title: string;

  organizationName?: string;

  columns: PDFColumn<T>[];

  data: T[];

  fileName: string;

  orientation?: "portrait" | "landscape";

}



export const generatePDF = <T extends object>({

  title,

  organizationName = "HRMS",

  columns,

  data,

  fileName,

  orientation = "landscape"

}: GeneratePDFProps<T>) => {


  const doc = new jsPDF({

    orientation,

    unit:"pt",

    format:"a4"

  });



  const pageWidth =
    doc.internal.pageSize.getWidth();



  // Header

  doc.setFillColor(
    13,
    110,
    253
  );


  doc.rect(
    0,
    0,
    pageWidth,
    60,
    "F"
  );



  doc.setTextColor(
    255,
    255,
    255
  );


  doc.setFontSize(18);


  doc.text(

    organizationName,

    pageWidth / 2,

    25,

    {
      align:"center"
    }

  );



  doc.setFontSize(14);


  doc.text(

    title,

    pageWidth / 2,

    45,

    {
      align:"center"
    }

  );



  // Date

  doc.setTextColor(
    80,
    80,
    80
  );


  doc.setFontSize(10);


  doc.text(

    `Generated Date : ${
      new Date().toLocaleDateString()
    }`,

    40,

    85

  );



  // Table


  autoTable(doc, {


    startY:100,


    head:[

      columns.map(
        c=>c.label
      )

    ],


    body:

      data.map(row=>

        columns.map(column=>

          String(
            (row as any)[column.key]
            ??
            ""
          )

        )

      ),



    theme:"grid",



    headStyles:{

      fillColor:[
        13,
        110,
        253
      ],

      textColor:255,

      fontStyle:"bold"

    },



    styles:{

      fontSize:9,

      cellPadding:5

    },



    alternateRowStyles:{

      fillColor:[
        245,
        245,
        245
      ]

    }


  });



  // Footer

  const pageCount =
    (doc as any).internal.getNumberOfPages();



  for(
    let i=1;
    i<=pageCount;
    i++
  ){

    doc.setPage(i);


    doc.setFontSize(9);


    doc.setTextColor(
      100,
      100,
      100
    );


    doc.text(

      `Page ${i} of ${pageCount}`,

      pageWidth - 80,

      doc.internal.pageSize.getHeight()-20

    );

  }



  doc.save(fileName);


};
