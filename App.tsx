
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MapPageLeaflet from './components/MapPage';
import MapPage from './mapcn/MapcnTestPage';
import ProfilePage from './components/ProfilePage';
import RouteBuilderPage from './components/RouteBuilderPage';
import MapRouteBuilder from './components/MapRouteBuilder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/map-leaflet" element={<MapPageLeaflet />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<RouteBuilderPage />} />
        <Route path="/builder" element={<MapRouteBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

