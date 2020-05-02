import React from 'react';

export default function Image({ src, fallback, className, ...otherProps }) {
  const [source, setSource] = React.useState(null);
  const combinedClassNames = ['Image', source === null ? 'Image-loading' : '', className].join(' ');

  // immediately return img if window unavialable
  if (!process.browser) {
    return <img className={combinedClassNames} src={source} {...otherProps} />;
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

  return <img className={combinedClassNames} src={source} {...otherProps} />;
}
