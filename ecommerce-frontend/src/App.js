import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppAdmin from './admin/AppAdmin';
import Home from './user/Home';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 
