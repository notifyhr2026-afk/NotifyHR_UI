import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import RoutesComponent from './Routes/RoutesComponent';

function App() {

  // useEffect(() => {
  //   // ✅ Apply dark mode on app load
  //   document.body.classList.remove('light-mode');
  //   document.body.classList.add('dark-mode');
  // }, []);

  return (
    <Router>
      <RoutesComponent />
    </Router>
  );
}

export default App;