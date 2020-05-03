import React from 'react';

const PLACEHOLDER_TIMEOUT_MS = 200;

export default function Image({ src, fallback, className, ...otherProps }) {
  const [source, setSource] = React.useState(TRANSPARENT_PNG);
  const [loading, setLoading] = React.useState(false);
  const combinedClassNames = ['Image', loading && source === TRANSPARENT_PNG ? 'Image-loading' : '', className].join(
    ' ',
  );

  // immediately return img if window unavialable
  if (!process.browser) {
    return <img className={combinedClassNames} src={source} {...otherProps} />;
  }

  const imageRef = React.useRef(new window.Image());

  // run once, on mount
  React.useEffect(() => {
    const startLoad = Date.now();
    const image = imageRef.current;
    image.onload = () => {
      // console.debug('Image', image.src);
      setSource(src);
    };
    image.onerror = (err) => {
      console.error('Image', err);
      setSource(fallback);
    };

    const timeoutId = setTimeout(() => {
      setLoading(true);
    }, PLACEHOLDER_TIMEOUT_MS);

    // begin loading image
    image.src = src;

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, []);

  return <img className={combinedClassNames} src={source} {...otherProps} />;
}

const TRANSPARENT_PNG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
