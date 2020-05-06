import React from 'react';

const isLocal = () => location.hostname === 'localhost';
const isDev = () => process.env.NODE_ENV !== 'production';

const MODULE_NAME = 'useGoogleAnalytics';

const gtagMock = (...args) => console.error('gtagMock', ...args);

function ensureGoogleAnalytics() {
  // google analytics not available in server
  // use mock for dev/local to avoid polluting events
  // if (!process.browser || isDev || isLocal) return gtagMock;
  if (!process.browser) return gtagMock;

  if (!window.gtag) {
    throw new Error('Google Analytics must be initalized before useGoogleAnalytics');
  }

  return window.gtag;
}

export default function useGoogleAnalytics() {
  const analytics = React.useMemo(() => {
    return {
      // Measure Google Analytics Events
      // https://developers.google.com/analytics/devguides/collection/gtagjs/events
      //
      // To send Google Analytics Events on a web page where the global site tag has been added, use the gtag.js event command with the following syntax
      // gtag('event', <action>, {
      //   'event_category': <category>,
      //   'event_label': <label>,
      //   'value': <value>
      // });
      //
      // To send a non-interaction event, set the non_interaction parameter to true
      // gtag('event', 'video_auto_play_start', {
      //   'event_label': 'My promotional video',
      //   'event_category': 'video_auto_play',
      //   'non_interaction': true
      // });
      event: (name, options) => {
        const gtag = ensureGoogleAnalytics();
        const { label, category, nonInteraction, ...extraData } = options;
        const gtagData = { ...extraData };

        if (label) gtagData.event_label = label;
        if (category) gtagData.event_category = category;
        if (nonInteraction) gtagData.non_interaction = true;

        console.info(MODULE_NAME, 'event', name, gtagData);
        gtag('event', name, gtagData);
      },
    };
  }, []);

  return analytics;
}
