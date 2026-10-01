import { createContext, useContext, useEffect, useState } from 'react';
import { english, translate } from '../data/interfaceText';

const UIContext = createContext(null);
export const readPreference = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};
export const savePreference = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* Browser preferences are optional; stories use IndexedDB. */ }
};

export function UIProvider({ children }) {
  const [locale, setLocale] = useState(() => readPreference('auverie_language', 'id') === 'en' ? 'en' : 'id');
  const [theme, setTheme] = useState(() => readPreference('au_studio_theme', 'light') === 'dark' ? 'dark' : 'light');
  useEffect(() => {
    savePreference('auverie_language', locale);
    document.documentElement.lang = locale;
    document.title = locale === 'id' ? 'Auverie · Ceritamu, layar demi layar' : 'Auverie · Your story, screen by screen';
    document.querySelector('meta[name="description"]')?.setAttribute('content', locale === 'id'
      ? 'Buat cerita AU melalui layar aplikasi, percakapan, postingan, dan kolase. Langsung menulis tanpa akun.'
      : 'Create AU stories with app screens, conversations, posts, and collages. Start writing without an account.');
  }, [locale]);
  useEffect(() => {
    savePreference('au_studio_theme', theme);
    document.documentElement.dataset.studioTheme = theme;
  }, [theme]);
  const t = (text, values) => translate(text, locale, values);
  const errorText = error => t(error?.code || (Object.hasOwn(english, error?.message) ? error.message : 'Terjadi masalah. Coba lagi.'), error?.details);
  return <UIContext.Provider value={{ locale, setLocale, theme, setTheme, t, errorText }}>{children}</UIContext.Provider>;
}

export const useUI = () => useContext(UIContext);
