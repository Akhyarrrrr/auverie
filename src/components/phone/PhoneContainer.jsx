import React, { forwardRef } from 'react';
import StatusBar from './StatusBar';
import WhatsAppView from '../mockups/WhatsAppView';
import TwitterView from '../mockups/TwitterView';
import InstagramView from '../mockups/InstagramView';
import LockscreenView from '../mockups/LockscreenView';
import { useProject } from '../../context/ProjectContext';
import { PHONE_MODELS } from '../../data/samplePresets';

const PhoneContainer = forwardRef(function PhoneContainer({ slide, zoom = 1 }, ref) {
  const { project } = useProject();
  const currentSlide = slide || project.slides[0];

  if (!currentSlide) {
    return <div className="no-slide">Belum ada slide.</div>;
  }

  const globalSettings = project.globalSettings || {};
  const currentModelId = globalSettings.phoneModel || 'iphone-16-pro';
  const modelConfig = PHONE_MODELS.find(m => m.id === currentModelId) || PHONE_MODELS[0];
  const bezelColor = globalSettings.bezelColor || modelConfig.colors[0]?.code || '#28292b';
  const theme = currentSlide.customSettings?.theme || globalSettings.theme || 'dark';

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
      case 'ig_story':
        return (
          <InstagramView
            slide={currentSlide}
            isPost={currentSlide.type === 'ig_post'}
            isStory={currentSlide.type === 'ig_story'}
          />
        );
      case 'lockscreen':
        return <LockscreenView slide={currentSlide} />;
      default:
        return <WhatsAppView slide={currentSlide} />;
    }
  };

  const isFrameless = currentModelId === 'frameless';

  return (
    <div
      className={`phone-mockup-outer model-${currentModelId}`}
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
        '--bezel-color': bezelColor,
        '--bezel-radius': modelConfig.bezelRadius,
        '--screen-radius': modelConfig.screenRadius
      }}
    >
      {/* Physical Hardware Buttons (iPhone style) */}
      {!isFrameless && currentModelId.startsWith('iphone') && (
        <>
          <div className="phone-button-action" />
          <div className="phone-button-volume-up" />
          <div className="phone-button-volume-down" />
          <div className="phone-button-power" />
        </>
      )}

      {/* Inner Screen Viewport - Rendered for Export */}
      <div
        className={`phone-screen-inner ${theme}`}
        ref={ref}
        id="phone-screen-canvas"
      >
        {/* Status Bar (Hide in full Instagram Story mode) */}
        {currentSlide.type !== 'ig_story' && (
          <StatusBar islandType={modelConfig.islandType} />
        )}

        <div className="mockup-scroll-container">
          {renderMockup()}
        </div>

        {/* iOS Home Indicator Bar */}
        {modelConfig.brand === 'Apple' && (
          <div className={`phone-home-indicator ${theme === 'light' ? 'home-indicator-dark' : ''}`} />
        )}
      </div>
    </div>
  );
});

export default PhoneContainer;
