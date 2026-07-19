import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../Button';
import './Hero.css';
import heroContent from '../../../content/Hero.json';

export function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = heroContent.slides;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="hero-section relative flex-1 w-full min-h-0">
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const description = t(slide.descriptionKey, slide.descriptionFallback) as string;
        const truncateLimit = slide.descriptionCharLimit || 100;
        const displayDescription = description.length > truncateLimit 
          ? description.substring(0, truncateLimit).trim() + '...' 
          : description;

        return (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            <div 
              className="hero-background"
              style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url('${slide.image}')` }}
            ></div>
            
            <div className="container hero-content-wrapper h-full relative z-10">
              <div className={`hero-box text-white rounded-xl shadow-2xl backdrop-blur-sm border border-white/20 transition-all duration-1000 delay-100 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <h1 className="text-4xl font-bold hero-title">
                  {t(slide.titleKey, slide.titleFallback) as string}
                </h1>
                <p className="text-xl hero-text mb-4" title={description}>
                  {displayDescription}
                </p>
                <div style={{ paddingTop: '2rem' }}>
                  <Button 
                    href={slide.cta.url} 
                    variant="white"
                    className="pointer-events-auto"
                  >
                    {t(slide.cta.labelKey, slide.cta.fallback) as string}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Modern Carousel Controls (Bottom Right) */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl">
        
        {/* Prev Button */}
        <button 
          onClick={prevSlide}
          aria-label="Slide anterior"
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-3 mx-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir para o slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === index ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button 
          onClick={nextSlide}
          aria-label="Próximo slide"
          className="text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </main>
  );
}
