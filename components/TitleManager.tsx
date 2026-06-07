import { useLocation } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const titles: Record<string, string> = {
  '/': 'Taxi Map - Luanda',
  '/map': 'Mapa - Taxi Map',
  '/map-leaflet': 'Mapa - Taxi Map',
  '/profile': 'Meu Perfil - Taxi Map',
  '/dashboard': 'Painel de Rotas - Taxi Map',
  '/builder': 'Construtor de Linhas - Taxi Map',
  '/admin': 'Admin - Taxi Map',
  '/auth/callback': 'Autenticação - Taxi Map',
  '/verify-email': 'Verificar Email - Taxi Map',
  '/forgot-password': 'Recuperar Password - Taxi Map',
  '/reset-password': 'Nova Password - Taxi Map',
};

export default function TitleManager() {
  const { pathname } = useLocation();
  useDocumentTitle(titles[pathname] || 'Taxi Map - Luanda');
  return null;
}
