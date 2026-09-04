/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { TopHeader } from './components/ui/TopHeader';
import { Header } from './components/ui/Header';
import { Hero } from './components/ui/Hero';
import { AppShowcase } from './components/ui/AppShowcase';
import { HowItWorks } from './components/ui/HowItWorks';
import { Community } from './components/ui/Community';
import { Faq } from './components/ui/Faq';
import { Footer } from './components/ui/Footer';
import { EarlyAccessModal } from './components/ui/EarlyAccessModal';
import { BusinessPage } from './components/ui/Business';
import { InstitutionalPage } from './components/ui/Institutional';
import { PartnersPage } from './components/ui/Partners';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { pageRegistry } from './pages/pageRegistry';
import { SLUG_TO_PAGE_ID } from './pages/routeConfig';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistModalMode, setWaitlistModalMode] = useState<"particular" | "empresa">("particular");

  const location = useLocation();
  const navigate = useNavigate();

  // Handle setting activeTab based on current route
  useEffect(() => {
    const path = location.pathname;

    // Top-level tabs
    if (path === '/empresas') setActiveTab(1);
    else if (path === '/institucional') setActiveTab(2);
    else if (path === '/parceiros') setActiveTab(3);
    else if (path === '/' || path === '/particulares') setActiveTab(0);
    // For other subroutes, we could infer the tab based on the page's logical parent,
    // but preserving the current activeTab or defaulting to 0 for generic pages is acceptable.
  }, [location]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    if (index === 0) navigate('/');
    else if (index === 1) navigate('/empresas');
    else if (index === 2) navigate('/institucional');
    else if (index === 3) navigate('/parceiros');
  };

  // Read URL query parameter for direct landing (SEO & Google Sitelinks support)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'empresas') {
      handleTabChange(1);
    } else if (tabParam === 'particulares') {
      handleTabChange(0);
    }
  }, []);

  // Dynamic Document Title and Meta Description Update based on active tab for SEO
  useEffect(() => {
    let title = "Táxi Map — Mobilidade Inteligente e Gestão de Frotas em Angola";
    let description = "Acompanhe táxis e candongueiros em tempo real em Luanda. Soluções completas para particulares e empresas de táxi com gestão de frotas, localização GPS e alertas em tempo real.";

    if (activeTab === 0) {
      title = "Táxi Map Particulares — Rotas e Candongueiros em Tempo Real em Luanda";
      description = "Acompanhe os táxis (candongueiros) em tempo real, consulte paragens, receba alertas de trânsito e planeie as suas viagens com facilidade em Luanda.";
    } else if (activeTab === 1) {
      title = "Táxi Map Empresas — Gestão de Frotas e Operadores de Táxi em Luanda";
      description = "Plataforma digital para gestão de frotas de táxi em Angola. Rastreamento GPS pelo telemóvel, controlo de motoristas, relatórios de produtividade e manutenção.";
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [activeTab]);

  const handleOpenWaitlist = (mode?: "particular" | "empresa") => {
    const selectedMode = mode || (activeTab === 1 ? "empresa" : "particular");
    setWaitlistModalMode(selectedMode);
    setIsWaitlistModalOpen(true);
  };

  return (
    <div className="app-container flex flex-col min-h-dvh w-full bg-white font-sans antialiased text-gray-900">
      {/* Sticky Header Wrapper */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <TopHeader activeTab={activeTab} setActiveTab={handleTabChange} />
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenWaitlist={handleOpenWaitlist}
        />
      </header>

      {/* Main Content Sections dynamically rendered based on React Router Routes */}
      <main className="flex-1 w-full flex flex-col">
        {/* A key por rota repõe o estado de erro quando o utilizador navega para outra página. */}
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <AppShowcase />
                <HowItWorks />
                <Community />
                <Faq />
              </>
            } />

            <Route path="/particulares" element={<Navigate to="/" replace />} />

            <Route path="/empresas" element={<BusinessPage onOpenWaitlist={() => handleOpenWaitlist("empresa")} />} />
            <Route path="/institucional" element={<InstitutionalPage onOpenWaitlist={() => handleOpenWaitlist("particular")} />} />
            <Route path="/parceiros" element={<PartnersPage onOpenWaitlist={() => handleOpenWaitlist("particular")} />} />

            {Object.entries(SLUG_TO_PAGE_ID).map(([slug, id]) => {
              const Component = pageRegistry[id];
              if (!Component) return null;
              return <Route key={slug} path={`/${slug}`} element={<Component />} />;
            })}

            <Route path="*" element={<pageRegistry._not_found />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Footer Component */}
      <Footer />

      {/* Early Access / Waitlist Modal */}
      <EarlyAccessModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        mode={waitlistModalMode}
      />
    </div>
  );
}

export default App;
