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

  // prevent scroll while modal is open
  React.useEffect(() => {
    document.body.style.overflow = modal.isVisible ? 'hidden' : null;
  }, [modal.isVisible]);

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

      <Footer>
        <Copyright>© 2020</Copyright>
        <div>Thanks to VillagerDB, Nintendo and the amazing Animal Crossing community.</div>
      </Footer>

      <ModalPortal />
    </Container>
  );
}

const Container = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 8px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const Footer = styled.footer`
  margin: 48px 24px 24px;
  font-size: 12px;
  color: var(--gray-color);
`;

const Copyright = styled.div`
  margin: 8px 0;
`;
