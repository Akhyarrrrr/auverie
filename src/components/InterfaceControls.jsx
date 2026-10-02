import { Languages, Moon, Sun } from 'lucide-react';
import { useUI } from '../context/UIContext';

export function Brand({ compact = false }) {
  return <span className={'auverie-brand' + (compact ? ' compact' : '')}>AU<em className="brand-join">v</em>erie<span className="brand-period">.</span></span>;
}

export default function InterfaceControls() {
  const { locale, setLocale, theme, setTheme, t } = useUI();
  return <div className="interface-controls">
    <button className="language-toggle" aria-label={t('Bahasa antarmuka')} title={t('Bahasa antarmuka')}
      onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}><Languages size={17} aria-hidden="true" /><span>{locale === 'id' ? 'ID' : 'EN'}</span></button>
    <button className="icon-button" aria-label={t(theme === 'light' ? 'Gelap' : 'Terang')} title={t('Tema antarmuka')}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
  </div>;
}
