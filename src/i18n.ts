import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';

i18n
  // Detects user language
  .use(LanguageDetector)
  // Passes i18n down to react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslation,
      pt: ptTranslation,
    },
    fallbackLng: 'pt', // Default to Portuguese
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    debug: true, // Remove in production
    interpolation: {
      escapeValue: false, // React already safeguards from xss
    },
  });

export default i18n;
