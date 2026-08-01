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

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <div className="app-container flex flex-col min-h-dvh w-full bg-white font-sans antialiased text-gray-900">
      {/* Sticky Header Wrapper */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenWaitlist={() => setIsWaitlistModalOpen(true)}
        />
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <AppShowcase />
        <HowItWorks />
        <Community />
        <Faq />
      </main>

      {/* Footer Component */}
      <Footer />

      {/* Early Access / Waitlist Modal */}
      <EarlyAccessModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </div>
  );
}

export default App;
