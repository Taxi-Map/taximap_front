
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MapPageLeaflet from './components/MapPage';
import MapPage from './mapcn/MapcnPage';
import ProfilePage from './components/ProfilePage';
import RouteBuilderPage from './components/RouteBuilderPage';
import MapRouteBuilder from './components/MapRouteBuilder';
import AuthCallback from './components/AuthCallback';

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
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

