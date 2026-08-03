import { useState, useEffect } from 'react';
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

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistModalMode, setWaitlistModalMode] = useState<"particular" | "empresa">("particular");

  // Read URL query parameter for direct landing (SEO & Google Sitelinks support)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'empresas') {
      setActiveTab(1);
    } else if (tabParam === 'particulares') {
      setActiveTab(0);
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
        <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenWaitlist={handleOpenWaitlist}
        />
      </header>

      {/* Main Content Sections dynamically rendered based on activeTab */}
      <main className="flex-1 w-full flex flex-col">
        {activeTab === 0 && (
          <>
            <Hero />
            <AppShowcase />
            <HowItWorks />
            <Community />
            <Faq />
          </>
        )}

        {activeTab === 1 && (
          <BusinessPage onOpenWaitlist={() => handleOpenWaitlist("empresa")} />
        )}

        {activeTab === 2 && (
          <InstitutionalPage onOpenWaitlist={() => handleOpenWaitlist("particular")} />
        )}

        {activeTab === 3 && (
          <PartnersPage onOpenWaitlist={() => handleOpenWaitlist("particular")} />
        )}
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
