import React, { createContext, useContext, useEffect, useState } from 'react';
import employeeService from '../services/employeeService';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface EmployeeData {
  Table?: any[];
  Table1?: any[];
  Table2?: any[];
  [key: string]: any;
}

interface EmployeeContextType {
  data: EmployeeData | null;
  reload: () => void;
  loading: boolean;
}

const EmployeeContext = createContext<EmployeeContextType>({
  data: null,
  reload: () => { },
  loading: false,
});

export const useEmployee = () => useContext(EmployeeContext);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { employeeID } = useParams<{ employeeID: string }>();
  const [data, setData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(false);
  interface EmployeeProviderProps {
    employeeID: number;
    children: React.ReactNode;
  }
  const fetchData = async () => {
    if (!employeeID) return;
    setLoading(true);
    try {
      alert(`EmployeeID from URL: ${employeeID}`); // ✅ This will now work
      const res = await employeeService.GetEmployeeDetialsByEmployeeID(parseInt(employeeID));
      setData(res);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employeeID]);

  return (
    <EmployeeContext.Provider value={{ data, reload: fetchData, loading }}>
      {children}
    </EmployeeContext.Provider>
  );
};
