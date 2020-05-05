import React from 'react';
import styled from 'styled-components';

import ModalProvider from 'src/components/ModalProvider';
import usePreventZoom from 'src/hooks/usePreventZoom';

export default function Providers({ children }) {
  return (
    <ModalProvider>
      <Page>{children}</Page>
    </ModalProvider>
  );
}

function ModalPortal() {
  const modal = React.useContext(ModalProvider.Context);

  return (
    <ModalProvider.Modal
      isVisible={modal.isVisible}
      title={modal.title}
      message={modal.message}
      buttons={modal.buttons}
      onDismiss={modal.closeModal}
    />
  );
}

function Page({ children }) {
  usePreventZoom();

  return (
    <Container>
      {children}

      <ModalPortal />
    </Container>
  );
}

const Container = styled.div`
  margin: 0;
  padding: 8px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;
