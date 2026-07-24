import * as XLSX from "xlsx";


interface ExcelColumn<T> {

  key: keyof T | string;

  label: string;

}


interface ExportExcelProps<T> {

  title?: string;

  columns: ExcelColumn<T>[];

  data: T[];

  fileName: string;

}



export const exportExcel = <T extends object>({

  title,

  columns,

  data,

  fileName

}: ExportExcelProps<T>) => {


  const excelData = data.map((row) => {


    const formattedRow:any = {};


    columns.forEach((column)=>{


      formattedRow[column.label] =

        (row as any)[column.key] ?? "";


    });


    return formattedRow;


  });



  let worksheetData:any[] = excelData;



  // Add report title

  if(title){

    worksheetData = [

      {
        Report:title
      },

      {},

      ...excelData

    ];

  }



  const worksheet = XLSX.utils.json_to_sheet(
    worksheetData,
    {
      skipHeader:false
    }
  );



  const workbook = XLSX.utils.book_new();



  XLSX.utils.book_append_sheet(

    workbook,

    worksheet,

    "Report"

  );



  XLSX.writeFile(

    workbook,

    `${fileName}.xlsx`

  );


};
