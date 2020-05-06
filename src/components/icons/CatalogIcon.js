import React from 'react';
import styled from 'styled-components';

export default function CatalogIcon({ active }) {
  return <Image active={active} aria-label="buy" src="/images/bells.36ea30.png" />;
}

const Image = styled.img`
  filter: ${(props) => (props.active ? 'none' : 'grayscale(1)')};
`;
