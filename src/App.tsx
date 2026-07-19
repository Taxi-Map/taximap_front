import { useTranslation } from 'react-i18next';
import './App.css'

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <div className="top-header bg-primary">
        <div className="container flex justify-between items-center top-header-inner">
          <div className="flex top-links">
            <a href="#" className="active">{t('header.individuals')}</a>
            <a href="#">{t('header.businesses')}</a>
            <a href="#">{t('header.institutional')}</a>
          </div>
          <div className="flex items-center gap-6 top-links-right">
            <a href="#">{t('header.customerSupport')}</a>
            <a href="#">{t('header.partners')}</a>
            <span className="separator">|</span>
            <div className="flex gap-2">
              <button 
                onClick={() => changeLanguage('pt')} 
                className={`font-bold hover:text-white transition-colors cursor-pointer ${i18n.language === 'pt' ? 'text-white' : ''}`}
              >PT</button>
              <span className="text-gray-800">/</span>
              <button 
                onClick={() => changeLanguage('en')} 
                className={`font-bold hover:text-white transition-colors cursor-pointer ${i18n.language === 'en' ? 'text-white' : ''}`}
              >EN</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="main-nav bg-white shadow-sm">
        <div className="container flex justify-between items-center main-nav-inner">
          <div className="logo">
            {/* Using a placeholder text for logo, user can replace with their SVG */}
            <div className="logo-placeholder flex items-center justify-center">
              <span className="text-primary font-bold text-xl">Táxi Map</span>
            </div>
          </div>
          <div className="flex items-center gap-8 nav-links">
            <a href="#" className="active font-bold">{t('nav.app')}</a>
            <a href="#" className="font-bold">{t('nav.howItWorks')}</a>
            <a href="#" className="font-bold">{t('nav.community')}</a>
            <a href="#" className="font-bold">{t('nav.news')}</a>
            <a href="#" className="font-bold">{t('nav.faq')}</a>
            <a href="#" className="font-bold text-primary underline underline-offset-4 decoration-2">{t('nav.login')}</a>
          </div>
        </div>
      </nav>

      {/* Hero Banner Area */}
      <main className="hero-section">
        {/* The background image would go here in a real scenario, simulating the grey area for now */}
        <div className="hero-background"></div>
        
        <div className="container hero-content-wrapper">
          <div className="hero-box text-white rounded-xl shadow-2xl backdrop-blur-sm border border-white/20">
            <h1 className="text-4xl font-bold hero-title">{t('hero.title')}</h1>
            <p className="text-xl hero-text mb-4">
              {t('hero.description')}
            </p>
            <button className="bg-white text-primary px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
              Começar agora
            </button>
          </div>
        </div>
        
        {/* Carousel controls simulation */}
        <button className="carousel-control prev" aria-label="Previous image">
           &lt;
        </button>
        <button className="carousel-control next" aria-label="Next image">
           &gt;
        </button>
      </main>
    </div>
  )
}

export default App
