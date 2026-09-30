import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';
import { UIProvider, readPreference } from './context/UIContext.jsx';

import './index.css';
import './styles/fonts.css';
import './styles/studio.css';
import './styles/welcome.css';
import './styles/phone-frame.css';
import './styles/mockups/whatsapp.css';
import './styles/mockups/twitter.css';
import './styles/mockups/instagram.css';
import './styles/mockups/lockscreen.css';
import './styles/mockups/custom.css';
import './styles/mockups/scenes.css';

class AppBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Auverie could not render:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    const english = readPreference('auverie_language', 'id') === 'en';
    return <main className="loading-screen"><strong className="auverie-brand">auverie.</strong><p role="alert">{english ? 'This screen could not be opened. Your saved stories are kept in this browser.' : 'Layar ini belum bisa dibuka. Cerita yang tersimpan tetap ada di browser ini.'}</p><button className="button primary" onClick={() => location.reload()}>{english ? 'Reload' : 'Muat ulang'}</button><a className="text-button" href="/">{english ? 'Home' : 'Beranda'}</a></main>;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppBoundary><UIProvider><ProjectProvider><App /></ProjectProvider></UIProvider></AppBoundary>
  </React.StrictMode>
);
