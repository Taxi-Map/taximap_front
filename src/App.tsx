import { useState } from 'react';
import { TopHeader } from './components/ui/TopHeader';
import { Header } from './components/ui/Header';
import { Hero } from './components/ui/Hero';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="app-container flex flex-col min-h-dvh w-full">
      <TopHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <Hero />
    </div>
  )
}

export default App
