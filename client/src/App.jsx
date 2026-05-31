import './App.css';

import { Route, Routes } from 'react-router-dom';

import Home from './pages/Home';
import ProfileList from './pages/ProfileList';
import ProfileDetail from './pages/ProfileDetail';
import Notfound from './pages/Notfound';
import Layout from './layouts/Layout';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/profiles' element={<ProfileList />} />
        <Route path='/profiles/:username' element={<ProfileDetail />} />
        <Route path='*' element={<Notfound />} />
      </Route>
    </Routes>
  );
}

export default App;
