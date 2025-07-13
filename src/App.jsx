
import './App.css'
import Formulaire_login from './Formulaire_login'
import Formulaire_signup from './Formulaire_signup'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Formulaire_login" element={<Formulaire_login />} />
        <Route path="/Formulaire_signup" element={<Formulaire_signup />} />
      </Routes>
      
    </Router>
  );
}

export default App;



