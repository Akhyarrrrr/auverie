import { forwardRef } from 'react';
import StatusBar from './StatusBar';
import AppSceneView from '../mockups/AppSceneView';
import WhatsAppView from '../mockups/WhatsAppView';
import TwitterView from '../mockups/TwitterView';
import InstagramView from '../mockups/InstagramView';
import LockscreenView from '../mockups/LockscreenView';
import CustomAppView from '../mockups/CustomAppView';
import { ProjectProvider, useProject } from '../../context/ProjectContext';
import { PHONE_MODELS } from '../../data/samplePresets';
import { deviceMetrics, finite } from '../../services/sceneModel';
import { sceneIdentity } from '../../data/sceneCatalog';

const PhoneContainer = forwardRef(function PhoneContainer({ slide, zoom = 1, previewCharacters, interactive = false, editable = false, bare = false, showHardware = false }, ref) {
  const { project } = useProject();
  const currentSlide = slide || project.slides[0];

  if (!currentSlide) {
    return <div className="no-slide">Belum ada slide.</div>;
  }

  const globalSettings = project.globalSettings || {};
  const currentModelId = String(currentSlide.customSettings?.phoneModel || globalSettings.phoneModel || 'iphone-16-pro');
  const modelConfig = PHONE_MODELS.find(m => m.id === currentModelId) || PHONE_MODELS[0];
  const platform = modelConfig.brand === 'Samsung' ? 'android' : modelConfig.brand === 'Apple' ? 'ios'
    : currentSlide.customSettings?.os || globalSettings.os || 'ios';
  const bezelColor = currentSlide.customSettings?.bezelColor || globalSettings.bezelColor || modelConfig.colors[0]?.code || '#28292b';
  const theme = currentSlide.customSettings?.theme || globalSettings.theme || 'dark';
  const metrics = deviceMetrics(currentSlide, globalSettings);
  const identity = sceneIdentity(currentSlide);

  const renderMockup = () => {
    if (currentSlide.renderVersion === 2 && identity.app) {
      const view = identity.app === 'whatsapp' ? <WhatsAppView slide={currentSlide} isGroup={identity.screen === 'group'} previewCharacters={previewCharacters} />
        : identity.app === 'x' ? <TwitterView slide={currentSlide} isDm={identity.screen === 'chat'} isThread={identity.screen === 'thread'} />
          : <InstagramView slide={currentSlide} isPost={identity.screen === 'post'} isStory={identity.screen === 'story'} previewCharacters={previewCharacters} />;
      const people = currentSlide.charactersSnapshot;
      return people ? <ProjectProvider previewProject={{ ...project, slides: [currentSlide], globalSettings: { ...globalSettings, ...currentSlide.customSettings },
        characters: people.filter(person => person.id !== 'me'), selfCharacter: people.find(person => person.id === 'me') }}>{view}</ProjectProvider> : view;
    }
    if (identity.app) return <AppSceneView slide={currentSlide} platform={platform} theme={theme} interactive={interactive} previewCharacters={previewCharacters} />;
    switch (currentSlide.type) {
      case 'lockscreen':
        return <LockscreenView slide={currentSlide} />;
      case 'custom_app':
        return <CustomAppView slide={currentSlide} interactive={interactive || editable} />;
      default:
        return <div className="unsupported-slide">Format slide ini belum tersedia.</div>;
    }
  };

  const isFrameless = currentModelId === 'frameless';

  return (
    <div
      className={`phone-mockup-outer model-${currentModelId} platform-${platform} render-version-${currentSlide.renderVersion || 3} ${bare ? 'bare-phone' : ''}`}
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        '--bezel-color': bezelColor,
        '--bezel-radius': modelConfig.bezelRadius,
        '--screen-radius': modelConfig.screenRadius,
        '--screen-width': `${metrics.width}px`,
        '--screen-height': `${metrics.height}px`,
        ...(['Inter', 'Roboto', 'Georgia'].includes(currentSlide.customSettings?.font) ? {
          '--phone-font-ui': `'${currentSlide.customSettings.font}', sans-serif`, '--phone-font-display': `'${currentSlide.customSettings.font}', sans-serif` } : {}),
        width: bare ? metrics.width : metrics.outerWidth,
        height: bare ? metrics.height : metrics.outerHeight,
        padding: bare ? 0 : metrics.inset
      }}
    >
      {/* Physical Hardware Buttons (iPhone style) */}
      {!bare && !isFrameless && currentModelId.startsWith('iphone') && (
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
        data-scene-id={currentSlide.id}
        data-intentional-viewport={currentSlide.viewport?.intentional ? 'true' : undefined}
      >
        {/* Status Bar (Hide in full Instagram Story mode) */}
        {!currentSlide.customSettings?.hideStatusBar && !(currentSlide.renderVersion === 2 && identity.screen === 'story') && (
          <StatusBar islandType={showHardware ? modelConfig.islandType : 'none'} slide={currentSlide}
            customSettings={['story', 'status', 'reel', 'instant', 'call'].includes(identity.screen) ? { theme: 'dark' } : {}} />
        )}

        <div className="mockup-scroll-container">
          {renderMockup()}
        </div>

        {/* iOS Home Indicator Bar */}
        {modelConfig.brand === 'Apple' && (
          <div className={`phone-home-indicator ${theme === 'light' ? 'home-indicator-dark' : ''}`} />
        )}
      </div>
      <style>{Object.entries(currentSlide.customSettings?.elementStyles || {}).filter(([, style]) => style && typeof style === 'object').map(([target, style]) => {
        const selector = `[data-scene-id=${JSON.stringify(String(currentSlide.id))}] [data-edit-target=${JSON.stringify(target)}]`;
        const rules = [style.fontSize ? `font-size:${finite(style.fontSize, 17, 6, 180)}px!important` : '',
          style.width ? `width:${finite(style.width, 100, 1, 1200)}px!important` : '',
          style.height ? `height:${finite(style.height, 40, 1, 2400)}px!important` : '',
          style.weight ? `font-weight:${finite(style.weight, 400, 100, 900)}!important` : '',
          /^#[\da-f]{3,8}$/i.test(style.color || '') ? `color:${style.color}!important` : '',
          /^#[\da-f]{3,8}$/i.test(style.background || '') ? `background-color:${style.background}!important` : '',
          `translate:${finite(style.x, 0, -1200, 1200)}px ${finite(style.y, 0, -2400, 2400)}px`,
          `rotate:${finite(style.rotation, 0, -360, 360)}deg`,
          style.hidden ? 'display:none!important' : '',
          style.radius !== undefined ? `border-radius:${finite(style.radius, 0, 0, 200)}px!important` : '',
        ].filter(Boolean).join(';');
        return `${selector}{${rules}}${style.iconSize ? `${selector} svg{width:${finite(style.iconSize, 24, 6, 120)}px!important;height:${finite(style.iconSize, 24, 6, 120)}px!important}` : ''}`;
      }).join('\n')}</style>
    </div>
  );
});

export default PhoneContainer;
