import React from 'react';

export default function useKeyboard() {
  const refs = React.useRef({
    div: null,
    originalHeight: 0,
    extraPaddingBottom: 0,
  });

  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  if (!process.browser) return { isKeyboardVisible };

  React.useEffect(() => {
    refs.current.div = document.createElement('div');
    const { div } = refs.current;
    div.style.height = '100vh';
    div.style.position = 'absolute';
    div.style.top = '-9999px';
    div.style.left = '-9999px';
    document.body.append(div);
    refs.current.originalHeight = div.offsetHeight;
  }, []);

  // when input focus / blur, check height of 100vh div
  // to determine whether keyboard is visible or hidden
  const onInputFocusEvents = () => {
    const { div, originalHeight } = refs.current;
    const currentHeight = div.offsetHeight;

    if (originalHeight > currentHeight) {
      refs.current.extraPaddingBottom = originalHeight - currentHeight;
      setIsKeyboardVisible(true);
    } else {
      refs.current.extraPaddingBottom = 0;
      setIsKeyboardVisible(false);
    }
  };

  const inputFocusEvents = {
    onFocus: onInputFocusEvents,
    onBlur: onInputFocusEvents,
  };

  const { extraPaddingBottom } = refs.current;
  const keyboardPaddingBottom = {
    paddingBottom: extraPaddingBottom,
  };

  return { isKeyboardVisible, inputFocusEvents, keyboardPaddingBottom };
}
