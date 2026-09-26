import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ProjectProvider } from './context/ProjectContext.jsx';

import './index.css';
import './styles/studio.css';
import './styles/phone-frame.css';
import './styles/mockups/whatsapp.css';
import './styles/mockups/twitter.css';
import './styles/mockups/instagram.css';
import './styles/mockups/lockscreen.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </React.StrictMode>
);
