import { BrowserRouter as Router} from 'react-router-dom';
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
