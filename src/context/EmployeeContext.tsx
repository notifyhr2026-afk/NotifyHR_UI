import React, { createContext, useContext, useState } from 'react';
import employeeService from '../services/employeeService';
import { toast } from 'react-toastify';

interface EmployeeData {
  Table?: any[];
  Table1?: any[];
  Table2?: any[];
  [key: string]: any;
}

interface EmployeeContextType {
  getEmployeeDetails: (employeeID: number) => Promise<EmployeeData | null>;
  clearCache: (employeeID?: number) => void;
}

const EmployeeContext = createContext<EmployeeContextType>({
  getEmployeeDetails: async () => null,
  clearCache: () => {},
});

export const useEmployee = () => useContext(EmployeeContext);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cache, setCache] = useState<Map<number, EmployeeData>>(new Map());

  const getEmployeeDetails = async (employeeID: number): Promise<EmployeeData | null> => {
    // Check cache first
    if (cache.has(employeeID)) {
      return cache.get(employeeID)!;
    }

    try {
      const res = await employeeService.GetEmployeeDetialsByEmployeeID(employeeID);
      // Update cache
      setCache(prev => new Map(prev).set(employeeID, res));
      return res;
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee data');
      return null;
    }
  };

  const clearCache = (employeeID?: number) => {
    if (employeeID) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(employeeID);
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  };

  return (
    <EmployeeContext.Provider value={{ getEmployeeDetails, clearCache }}>
      {children}
    </EmployeeContext.Provider>
  );
};
