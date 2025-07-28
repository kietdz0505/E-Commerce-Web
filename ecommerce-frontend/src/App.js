import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppAdmin from './admin/AppAdmin';
import Home from './user/Home';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />     
        <Route path="/" element={<Home/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
