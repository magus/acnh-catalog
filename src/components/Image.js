import React from 'react';

const PLACEHOLDER_TIMEOUT_MS = 1000;

export default function Image({ src, fallback, className, ...otherProps }) {
  const [source, setSource] = React.useState(src);
  const [loading, setLoading] = React.useState(false);
  const combinedClassNames = ['Image', loading ? 'Image-loading' : '', className].join(' ');

  // immediately return img if window unavialable
  if (!process.browser) {
    return <img className={combinedClassNames} src={source} {...otherProps} />;
  }

  const imageRef = React.useRef(new window.Image());

  // run once, on mount
  React.useEffect(() => {
    const startLoad = Date.now();
    const image = imageRef.current;

    // Begin a timer to show loading placeholder
    // Returns a function to cancel timer and clear loading state
    const clearLoadingTimeout = (() => {
      const timeoutId = setTimeout(() => {
        setLoading(true);
      }, PLACEHOLDER_TIMEOUT_MS);

      // Ensure we stop the loading timer and clear loading
      return () => {
        setLoading(false);
        clearTimeout(timeoutId);
      };
    })();

    image.onload = () => {
      // console.debug('Image', image.src);
      clearLoadingTimeout();
    };
    image.onerror = (err) => {
      console.error('Image', err);
      if (fallback) {
        clearLoadingTimeout();
        setSource(fallback);
      }
    };

    // begin loading image
    image.src = src;

    return function cleanup() {
      clearLoadingTimeout();
    };
  }, []);

  return <img className={combinedClassNames} src={source} {...otherProps} />;
}

const TRANSPARENT_PNG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
