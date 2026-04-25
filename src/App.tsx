import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import RoutesComponent from './Routes/RoutesComponent';
import { EmployeeProvider } from './context/EmployeeContext';

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
      document.body.classList.remove('dark-mode', 'light-mode');
      document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
      document.body.dataset.theme = theme;
    }
  }, []);

  return (
    <Router>
      <EmployeeProvider>
        <RoutesComponent />
      </EmployeeProvider>
    </Router>
  );
}

export default App;