import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';

const DISMISS_VELOCITY = 300;

export const ModalContext = React.createContext({
  isVisible: false,
  title: null,
  message: null,
  buttons: [],
  openModal: () => console.warn('ModalProvider not initialized in parent tree'),
  closeModal: () => console.warn('ModalProvider not initialized in parent tree'),
});

export default function ModalProvider({ children }) {
  const openModal = (modal) => {
    setContextValue({ ...contextValue, isVisible: true, ...modal });
  };

  const closeModal = () => {
    setContextValue({ ...contextValue, isVisible: false });
  };

  const [contextValue, setContextValue] = React.useState({
    isVisible: false,
    title: null,
    message: null,
    buttons: [],
  });

  return (
    <ModalContext.Provider
      value={{
        ...contextValue,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

ModalProvider.Context = ModalContext;
ModalProvider.Modal = Modal;

function Modal({ isVisible, title, message, buttons, onDismiss }) {
  const handleDismiss = () => {
    if (typeof onDismiss === 'function') onDismiss();
  };

  const handleDrag = (event, info) => {
    if (Math.abs(info.velocity.x) > DISMISS_VELOCITY || Math.abs(info.velocity.y) > DISMISS_VELOCITY) {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <OuterContainer onClick={handleDismiss} />
          <ModalContainer>
            <ModalContent
              drag
              dragMomentum={false}
              dragTransition={{
                type: 'spring',
                restDelta: 0.5,
              }}
              onDragEnd={handleDrag}
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
            >
              <Title>{title}</Title>
              <Message>{message}</Message>

              <Buttons>
                {buttons.map((options, i) => (
                  <ModalButton key={i} options={options} handleDismiss={handleDismiss} />
                ))}
              </Buttons>
            </ModalContent>
          </ModalContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalButton({ options, handleDismiss }) {
  const [wait, setWait] = React.useState(Math.round(options.wait));
  const [disabled, setDisabled] = React.useState(typeof options.wait === 'number');

  const clickHandler = options.dismiss
    ? (e) => {
        options.onClick(e);
        handleDismiss();
      }
    : options.onClick;

  const className = [options.subtle ? 'subtle' : ''].join(' ');

  React.useEffect(() => {
    if (typeof options.wait !== 'number') return;

    const start = Date.now();
    const waitTime = Math.round(options.wait);

    let timeoutId;

    function checkWaitTime() {
      const now = Date.now();
      const elapsed = now - start;
      const secondsLeft = waitTime - Math.floor(elapsed / 1000);
      // console.debug({ waitTime, secondsLeft });

      if (secondsLeft <= 0) {
        // done!
        setDisabled(false);
        setWait(0);
      } else {
        // continue checking and updating
        setWait(secondsLeft);
        timeoutId = setTimeout(checkWaitTime, 200);
      }
    }

    checkWaitTime();

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Button disabled={disabled} className={className} onClick={clickHandler}>
      {options.text} {wait ? `(${wait}s)` : ''}
    </Button>
  );
}

const OuterContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(11, 11, 11, 0.8);
`;

const ModalContainer = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled(motion.div)`
  pointer-events: all;
  max-width: 80%;
  max-height: 60%;
  background-color: var(--bg-color);
  border-radius: 0.5rem;
  padding: 1rem 2rem;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 18px;
  margin: 16px 0;
`;

const Message = styled.div`
  font-weight: 200;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin: 24px 0 0 0;
`;

const Button = styled.button`
  margin: 0 8px 8px 0;
`;
