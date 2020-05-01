import React from 'react';
import styled from 'styled-components';

export default function Text({ children, fontSize, minFontSize = 12 }) {
  const containerRef = React.createRef();

  const setFontSize = (fontSize) => {
    const container = containerRef.current;
    container.style.fontSize = px(fontSize);
    return isTruncated(container);
  };

  const shrink = () => {
    const container = containerRef.current;
    console.debug({ container });

    container.style.fontSize = null;
    // void container.offsetWidth;
    const detectedFontSize = fontSize || parseInt(getComputedStyle(container).fontSize, 10);

    let max = detectedFontSize;
    let min = minFontSize;
    let truncated = false;
    let found = min;
    let iters = 0;
    const maxIters = Math.log2(max - min) + 1;

    if (!isTruncated(container)) return console.debug('no shrink required');

    console.debug('shrink', { min, max });

    // font size can be adjusted
    while (max > min && min < max) {
      console.debug({ min, max });
      if (iters > maxIters) return console.error('exceeded expected log(n) performance');
      iters++;

      // test new font size
      const newFontSize = Math.floor((max + min) / 2);
      truncated = setFontSize(newFontSize);

      if (truncated) {
        // decrease max
        max = newFontSize - 1;
        console.debug('decreasing max', max);
      } else {
        // Record new max found font size
        if (newFontSize > found) found = newFontSize;

        // increase min
        min = newFontSize + 1;
        console.debug('increasing min', min);
      }
    }

    console.debug('found font size', { iters, found, min, max });
    setFontSize(found);
  };

  React.useEffect(shrink, []);
  return <Container ref={containerRef}>{children}</Container>;
}

const px = (size) => `${size}px`;

function isTruncated(node) {
  return node.offsetWidth < node.scrollWidth;
}

const Container = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: inline-block;
`;
