import React from 'react';
import styled from 'styled-components';

export default function NoResults() {
  return (
    <NoResultsText>
      No matches found.<Smaller>Try adjusting your search or filters.</Smaller>
    </NoResultsText>
  );
}

const NoResultsText = styled.div`
  text-align: center;
  color: var(--gray-color);
  font-weight: 200;
`;

const Smaller = styled.div`
  font-size: 12px;
`;
