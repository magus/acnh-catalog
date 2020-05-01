import React from 'react';

export default function Image({ src, fallback, ...otherProps }) {
  const [source, setSource] = React.useState(null);

  // immediately return img if window unavialable
  if (!process.browser) {
    return <img src={source} {...otherProps} />;
  }

  const imageRef = React.useRef(new window.Image());

  React.useEffect(() => {
    const image = imageRef.current;
    image.onload = () => {
      // console.debug('Image', image.src);
      setSource(src);
    };
    image.onerror = (err) => {
      console.error('Image', err);
      setSource(fallback);
    };
    image.src = src;
  }, []);

  return <img src={source} {...otherProps} />;
}
