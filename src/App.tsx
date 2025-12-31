import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Main/Home';
import LoginPage from './pages/Main/Login';
import Dashboard from './pages/Main/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Menus from './pages/Features/Menus';
import Organizations from './pages/Organization/OrganizationList';
import ManageOrganization  from './pages/Organization/ManageOrganization';
import ManageEmployee from './pages/Employee/ManageEmployee';
import ManageBranches from './pages/Organization/ManageBranches';
import ManageDivisions from './pages/Organization/ManageDivisions';
import ManageUsers from './pages/Organization/ManageUsers';
import ManageDepartments from './pages/Organization/ManageDepartments';
import AssignRoles from './pages/Organization/AssignRoles';
import AssignPositions from './pages/Organization/AssignPositions';
import ManagePositions from './pages/Organization/ManagePositions';
import OrganizationLeavePolicies from './pages/Leave/OrganizationLeavePolicies';
import ResetPassword from './pages/Main/ResetPassword';
import ChangePassword from './pages/Main/ChangePassword';
import EmployeeList from './pages/Employee/EmployeeList';
import ApplyLeave from './pages/Leave/ApplyLeave';
import VendorDetails from './pages/Asset/VendorDetails'
import AssetList from './pages/Asset/AssetList';
import AssetTracking from './pages/Asset/AssetTracking';
import AssetAssignmentPage from './pages/Asset/AssetAssignmentPage';
import EmployeeClock from './components/Employee/EmployeeClock';
import ManageRoles from './pages/Organization/ManageRoles';
import MyProfile from './pages/Employee/MyProfile';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import OrganizationFeatures from './pages/Organization/OrganizationFeatures';
import HolidaySettings from './pages/Holiday/HolidaySettings';
import ManageHolidays from './pages/Holiday/ManageHolidays';
import HolidayList from './pages/Holiday/HolidayList';
import ShiftManagement from './pages/Shift/ShiftManagement';
import PlanList from './pages/Organization/PlanManagement';
import ManageJobRequisitions from './components/Recruitment/ManageJobRequisitions';
import JobRecruiter from './components/Recruitment/JobRecruiter';
import ManageJobRequisitionApprovals from './components/Recruitment/ManageJobRequisitionApprovals';
// ✅ import new context and component
import { EmployeeProvider } from './context/EmployeeContext';
import RoleMenuPermissions from './pages/Features/RoleMenuPermissions';
import AssignedRoles from './pages/Organization/AssignedRoles';
import AssignedPositions from './pages/Organization/AssignedPositions';
import AttendanceCalendar from './pages/Attendance/AttendanceCalendar';
import EmployeeAttendanceLogs from './pages/Attendance/EmployeeAttendanceLogs';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="ResetPassword" element={<ResetPassword />} />       
        {/* Dashboard layout routes */}
      
        <Route path="/" element={<DashboardLayout />}>
          <Route path="menus" element={<Menus />} />
          <Route path="Organizations" element={<Organizations />} />
          <Route path="organizations/ManageOrganization/:id" element={<ManageOrganization />} />
          <Route path="ManageRoles" element={<ManageRoles />} />
          <Route path="Organization" element={<ManageOrganization />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="Employees/manageEmployee/:employeeID" element={<ManageEmployee />} />
          <Route path="Branches" element={<ManageBranches />} />
          <Route path="Divisions" element={<ManageDivisions />} />
          <Route path="Users" element={<ManageUsers />} />
          <Route path="Departments" element={<ManageDepartments />} />
          <Route path="AssignRoles" element={<AssignRoles />} />
          <Route path="AssignPositions" element={<AssignPositions />} />
          <Route path="Holidays" element={<ManageHolidays />} />
          <Route path="LeavePolicies" element={<OrganizationLeavePolicies />} />
          <Route path="MyProfile" element={<MyProfile />} />
          <Route path="ChangePassword" element={<ChangePassword />} />
          <Route path="EmployeeList" element={<EmployeeList />} />
          <Route path="ApplyLeave" element={<ApplyLeave />} />
          <Route path="VendorDetails" element={<VendorDetails />} />
          <Route path="AssetList" element={<AssetList />} />
          <Route path="AssetTracking" element={<AssetTracking />} />
          <Route path="AssetAssignment" element={<AssetAssignmentPage />} />
          <Route path="EmployeeClock" element={<EmployeeClock />} />
          <Route path="EmployeeDashboard" element={<EmployeeDashboard />} />
          <Route path="OrganizationFeatures" element={<OrganizationFeatures />} />
          <Route path="HolidaySettings" element={<HolidaySettings />} />
          <Route path="HolidayList" element={<HolidayList />} />
          <Route path="ShiftManagement" element={<ShiftManagement />} />
          <Route path="AttendanceCalendar" element={<AttendanceCalendar />} />
          <Route path="plans" element={<PlanList />} />
          <Route path="JobRequisition" element={<ManageJobRequisitions />} />
          <Route path="JobRecruiter" element={<JobRecruiter />} />
          <Route path="JobRequisitionApprovals" element={<ManageJobRequisitionApprovals />} />
          <Route path="RoleMenuPermissions" element={<RoleMenuPermissions />} />
          <Route path="ManagePositions" element={<ManagePositions />} />  
          <Route path="/AssignedRoles" element={<AssignedRoles />} /> 
          <Route path="/AssignedPositions" element={<AssignedPositions />} />
          <Route path="/EmployeeAttendanceLogs" element={<EmployeeAttendanceLogs />} />
          {/* ✅ Add your new EmployeeDetails route */}
          <Route
            path="Employees/manageEmployee/:employeeID"
            element={
              <EmployeeProvider>
                <ManageEmployee />
              </EmployeeProvider>
            } 
            />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
