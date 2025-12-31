import React, { useState } from "react";

interface AssetRecord {
  id: number;
  assetName: string;
  assignedDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  conditionOnReturn: string;
  remarks: string;
  reportRemarks: string;
}

const EmployeeAsset: React.FC = () => {
  const [data, setData] = useState<AssetRecord[]>([
    {
      id: 1,
      assetName: "Laptop - Dell",
      assignedDate: "2024-01-10",
      expectedReturnDate: "2024-12-31",
      actualReturnDate: "2024-12-20",
      conditionOnReturn: "Good",
      remarks: "No issues",
      reportRemarks: ""
    }
  ]);

  const handleReportRemarksChange = (
    id: number,
    value: string
  ) => {
    setData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, reportRemarks: value } : item
      )
    );
  };

  const handleReport = (row: AssetRecord) => {
    console.log("Report Submitted:", row);
    alert(`Report submitted for ${row.assetName}`);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Asset Return Report</h4>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Asset Name</th>
              <th>Assigned Date</th>
              <th>Expected Return Date</th>
              <th>Actual Return Date</th>
              <th>Condition On Return</th>
              <th>Remarks</th>
              <th>Report Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>{row.assetName}</td>
                <td>{row.assignedDate}</td>
                <td>{row.expectedReturnDate}</td>
                <td>{row.actualReturnDate}</td>
                <td>{row.conditionOnReturn}</td>
                <td>{row.remarks}</td>

                <td>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter report remarks"
                    value={row.reportRemarks}
                    onChange={e =>
                      handleReportRemarksChange(row.id, e.target.value)
                    }
                  />
                </td>

                <td className="text-center">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleReport(row)}
                  >
                    Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAsset;
