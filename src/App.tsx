import { useState } from 'react';
import { TopHeader } from './components/ui/TopHeader';
import { Header } from './components/ui/Header';
import { Hero } from './components/ui/Hero';
import { AppShowcase } from './components/ui/AppShowcase';
import { HowItWorks } from './components/ui/HowItWorks';
import { Community } from './components/ui/Community';
import { Footer } from './components/ui/Footer';

import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="app-container flex flex-col min-h-dvh w-full bg-white font-sans antialiased text-gray-900">
      {/* Sticky Header Wrapper */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <AppShowcase />
        <HowItWorks />
        <Community />
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

export default App;
