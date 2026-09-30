import { Moon, Sun } from 'lucide-react';
import { useUI } from '../context/UIContext';

export function Brand({ compact = false }) {
  return <span className={'auverie-brand' + (compact ? ' compact' : '')}>au<span className="brand-join">v</span>erie<span className="brand-period">.</span></span>;
}

export default function InterfaceControls() {
  const { locale, setLocale, theme, setTheme, t } = useUI();
  return <div className="interface-controls">
    <button className="language-toggle" aria-label={t('Bahasa antarmuka')} title={t('Bahasa antarmuka')}
      onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}><span className={locale === 'id' ? 'chosen' : ''}>ID</span><span aria-hidden="true">/</span><span className={locale === 'en' ? 'chosen' : ''}>EN</span></button>
    <button className="icon-button" aria-label={t(theme === 'light' ? 'Gelap' : 'Terang')} title={t('Tema antarmuka')}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
  </div>;
}
