import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Main/Home';
import LoginPage from './pages/Main/Login';
import Dashboard from './pages/Main/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import RoutesComponent from './Routes/RoutesComponent';

function App() {
  return (
  <Router>
      <RoutesComponent />
    </Router>
  );
}

export default App;
