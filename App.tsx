
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MapPageLeaflet from './components/MapPage';
import MapPage from './mapcn/MapcnTestPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/map-leaflet" element={<MapPageLeaflet />} />
      </Routes>
    </BrowserRouter>
  );
}

