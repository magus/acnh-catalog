import React from 'react';

import Page from 'src/pages/Page';
import Search from './Search';
import { GlobalStyle } from './styles.js';

export default function SearchPage() {
  return (
    <Page>
      <GlobalStyle />

      <Search />
    </Page>
  );
}
