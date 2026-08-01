import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import headerContent from '../../../content/Header.json';
import topHeaderContent from '../../../content/TopHeader.json';
import languagesConfig from '../../../content/languages.json';
import './Header.css';

interface HeaderProps {
  activeTab: number;
  setActiveTab: (idx: number) => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('app');

  // Settings for the Mobile Menu
  const languages = languagesConfig;
  const leftLinks = topHeaderContent.leftLinks;
  const rightLinks = topHeaderContent.rightLinks;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Bulletproof ScrollSpy with scroll listener and offset calculation
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        'app',
        'how-it-works',
        'community',
        'faq',
        'solution',
        'features',
        'plans',
        'about',
        'history',
        'impact',
      ];

      const headerOffset = 140; // Sticky header offset
      const scrollPosition = window.scrollY + headerOffset;

      let current = '';
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Smooth scroll handler on link click with offset adjustment for sticky header
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (url.startsWith('#')) {
      e.preventDefault();
      const targetId = url.substring(1);
      if (!targetId) return;

      const element = document.getElementById(targetId);
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        setActiveSection(targetId);
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className="main-nav bg-white shadow-sm relative z-40">
        <div className="container px-8 flex justify-between items-center main-nav-inner">
          <div className="logo ">
            <a href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Táxi Map"
                className="h-20 w-auto -mt-6 relative z-50 drop-shadow-md"
              />
            </a>
          </div>

          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-8 nav-links">
            {headerContent.tabs[activeTab]?.links.map((link, idx) => {
              const targetId = link.url.replace('#', '');
              const isActive = activeSection === targetId;

              return (
                <a
                  key={idx}
                  href={link.url}
                  onClick={(e) => handleNavClick(e, link.url)}
                  className={`font-bold transition-colors ${
                    isActive ? 'active' : 'text-gray-900 hover:text-[#6DB7E2]'
                  } ${
                    link.isAction
                      ? 'text-[#6DB7E2] underline underline-offset-4 decoration-2'
                      : ''
                  }`}
                >
                  {t(link.labelKey, link.fallback) as string}
                </a>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden animate-in fade-in slide-in-from-right-8 duration-300 ease-out">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
            {/* Language Segmented Control */}
            <div className="flex bg-gray-100 p-1.5 rounded-none gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-6 py-2 rounded-none text-base font-bold transition-all ${
                    i18n.language === lang.code
                      ? 'bg-white text-primary shadow-md'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="relative pt-2 border-b border-gray-100">
            {/* Visual affordance for horizontal scroll */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-white to-transparent z-10 pointer-events-none"></div>

            <div className="flex overflow-x-auto hide-scrollbar gap-8 px-8">
              {leftLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`shrink-0 pb-4 pt-2 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                    activeTab === idx ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t(link.labelKey, link.fallback) as string}
                  {activeTab === idx && (
                    <div className="absolute bottom-0 left-0 w-full h-0.75 bg-primary rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content (Dynamic body links) */}
          <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {headerContent.tabs[activeTab]?.links
                .filter((l: any) => !l.isAction)
                .map((link: any, idx: number) => {
                  const targetId = link.url.replace('#', '');
                  const isActive = activeSection === targetId;

                  return (
                    <a
                      key={idx}
                      href={link.url}
                      onClick={(e) => handleNavClick(e, link.url)}
                      className={`text-2xl font-bold transition-colors ${
                        isActive ? 'text-[#6DB7E2]' : 'text-gray-900 hover:text-[#6DB7E2]'
                      }`}
                    >
                      {t(link.labelKey, link.fallback) as string}
                    </a>
                  );
                })}
            </div>

            {headerContent.tabs[activeTab]?.links
              .filter((l: any) => l.isAction)
              .map((link: any, idx: number) => (
                <div key={idx} className="mt-4 pt-8 border-t border-gray-100">
                  <a
                    href={link.url}
                    onClick={(e) => handleNavClick(e, link.url)}
                    className="text-xl font-bold text-primary flex items-center gap-2"
                  >
                    {t(link.labelKey, link.fallback) as string}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              ))}
          </div>

          {/* Bottom Footer Links */}
          <div className="px-8 py-8 bg-gray-50 flex flex-col gap-5 border-t border-gray-200">
            {rightLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                className="text-sm font-semibold text-gray-600 hover:text-primary flex items-center gap-3 transition-colors"
              >
                {t(link.labelKey, link.fallback) as string}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
