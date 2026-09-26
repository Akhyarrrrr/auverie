import React, { forwardRef } from 'react';
import StatusBar from './StatusBar';
import WhatsAppView from '../mockups/WhatsAppView';
import TwitterView from '../mockups/TwitterView';
import InstagramView from '../mockups/InstagramView';
import LockscreenView from '../mockups/LockscreenView';
import { useProject } from '../../context/ProjectContext';

const PhoneContainer = forwardRef(function PhoneContainer({ slide, zoom = 1 }, ref) {
  const { project } = useProject();
  const currentSlide = slide || project.slides[0];

  if (!currentSlide) {
    return <div className="no-slide">Belum ada slide.</div>;
  }

  const theme = currentSlide.customSettings?.theme || project.globalSettings.theme || 'dark';

  const renderMockup = () => {
    switch (currentSlide.type) {
      case 'wa_chat':
      case 'wa_group':
        return <WhatsAppView slide={currentSlide} isGroup={currentSlide.type === 'wa_group'} />;
      case 'x_tweet':
      case 'x_dm':
        return <TwitterView slide={currentSlide} isDm={currentSlide.type === 'x_dm'} />;
      case 'ig_dm':
      case 'ig_post':
        return <InstagramView slide={currentSlide} isPost={currentSlide.type === 'ig_post'} />;
      case 'lockscreen':
        return <LockscreenView slide={currentSlide} />;
      default:
        return <WhatsAppView slide={currentSlide} />;
    }
  };

  return (
    <div
      className="phone-mockup-outer"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'center center'
      }}
    >
      {/* Inner Screen - This exact container is rendered to high-res PNG for TikTok / X */}
      <div
        className={`phone-screen-inner ${theme}`}
        ref={ref}
        id="phone-screen-canvas"
      >
        <StatusBar />
        <div className="mockup-scroll-container">
          {renderMockup()}
        </div>
        <div className={`phone-home-indicator ${theme === 'light' ? 'home-indicator-dark' : ''}`} />
      </div>
    </div>
  );
});

export default PhoneContainer;
