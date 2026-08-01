import { useTranslation } from 'react-i18next';
import { Phone, Mail } from 'lucide-react';
import type { FooterProps } from './types';
import footerContent from '../../../content/Footer.json';
import './Footer.css';

/* ─── Brand SVG Icons ─────────────────────────────────── */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ─── Social icon map ─────────────────────────────────── */
const SOCIAL_ICONS: Record<string, React.ComponentType> = {
  facebook:  FacebookIcon,
  instagram: InstagramIcon,
  linkedin:  LinkedinIcon,
  youtube:   YoutubeIcon,
};

const HEADER_KEY_MAP: Record<string, string> = {
  particulares: 'header.individuals',
  empresas: 'header.businesses',
  institucional: 'header.institutional',
  parceiros: 'header.partners',
};

const NAV_KEY_MAP: Record<string, string> = {
  '#app': 'nav.app',
  '#how-it-works': 'nav.howItWorks',
  '#community': 'nav.community',
  '#news': 'nav.news',
  '#faq': 'nav.faq',
  '#solution': 'nav.solution',
  '#features': 'nav.features',
  '#plans': 'nav.plans',
};

/* ─── Footer Component ────────────────────────────────── */
export function Footer({ className = '' }: FooterProps) {
  const { t } = useTranslation();
  const { columns, contacts, social, copyright, termsLabel, termsUrl } = footerContent;

  return (
    <footer className={`footer-root ${className}`}>

      {/* ── Logo Bar ──────────────────────────────────── */}
      <div className="footer-logo-bar">
        <a href="/" aria-label="Táxi Map — Início">
          <img
            src="/logo.png"
            alt="Táxi Map"
            style={{ height: '7rem', width: 'auto', objectFit: 'contain' }}
          />
        </a>
      </div>

      {/* ── Main Grid ─────────────────────────────────── */}
      <div className="footer-main">

        {/* Nav columns — driven by JSON */}
        {columns.map((col) => {
          const colHeadingKey = HEADER_KEY_MAP[col.id] || '';
          const headingText = colHeadingKey ? t(colHeadingKey, col.heading) : col.heading;

          return (
            <div key={col.id}>
              <span className="footer-col-heading">{headingText}</span>
              <ul className="footer-nav-list">
                {col.links.map((link) => {
                  const navKey = NAV_KEY_MAP[link.url] || '';
                  const labelText = navKey ? t(navKey, link.label) : link.label;

                  return (
                    <li key={link.url}>
                      <a href={link.url} className="footer-nav-link">
                        <span className="footer-nav-bullet" aria-hidden="true">°</span>
                        {labelText}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Contacts column — driven by JSON */}
        <div>
          <span className="footer-col-heading">{t('footer.contacts', contacts.heading)}</span>

          <div className="footer-contact-list">
            {/* Phone */}
            <a href={contacts.phone.href} className="footer-contact-box">
              <span className="footer-contact-icon">
                <Phone size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="footer-contact-label">{t('footer.phone', contacts.phone.label)}</p>
                <p className="footer-contact-value">{contacts.phone.value}</p>
              </div>
            </a>

            {/* Email */}
            <a href={contacts.email.href} className="footer-contact-box">
              <span className="footer-contact-icon">
                <Mail size={18} strokeWidth={2} />
              </span>
              <div>
                <p className="footer-contact-label">{t('footer.email', contacts.email.label)}</p>
                <p className="footer-contact-value">{contacts.email.value}</p>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* ── Bottom Bar ────────────────────────────────── */}
      <div className="footer-bottom-bar">
        {/* Copyright — driven by JSON */}
        <p className="footer-copyright">
          <span>{t('footer.copyright', copyright)}</span>
          <span style={{ color: '#d1d5db' }}>·</span>
          <a href={termsUrl}>{t('footer.terms', termsLabel)}</a>
        </p>

        {/* Social icons — driven by JSON */}
        <div className="footer-socials">
          {social.map(({ id, label, url }) => {
            const Icon = SOCIAL_ICONS[id];
            if (!Icon) return null;
            return (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="footer-social-btn"
              >
                <Icon />
              </a>
            );
          })}
        </div>
      </div>

    </footer>
  );
}
