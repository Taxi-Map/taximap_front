import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MapPageLeaflet from './components/MapPage';
import MapPage from './mapcn/MapcnPage';
import ProfilePage from './components/ProfilePage';
import RouteBuilderPage from './components/RouteBuilderPage';
import MapRouteBuilder from './components/MapRouteBuilder';
import AdminPanelPage from './components/AdminPanelPage';
import AuthCallback from './components/AuthCallback';
import VerifyEmailPage from './components/VerifyEmailPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/map-leaflet" element={<MapPageLeaflet />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <RouteBuilderPage />
          </ProtectedRoute>
        } />
        <Route path="/builder" element={
          <ProtectedRoute>
            <MapRouteBuilder />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminPanelPage />
          </ProtectedRoute>
        } />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}
