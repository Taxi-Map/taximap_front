import { useState } from 'react';
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
