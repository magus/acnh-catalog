import React from 'react';

import Page from 'src/pages/Page';
import Search from './Search';
import { GlobalStyle } from './styles.js';

function SearchPage(props) {
  return (
    <Page>
      <GlobalStyle />

      <Search {...props} />
    </Page>
  );
}

const randItem = (catalog) => catalog[Math.floor(Math.random() * catalog.length)];

SearchPage.getInitialProps = async () => {
  const ITEM_CATALOG = (await import('../../../public/data/2020-11-03-items.json')).default;

  const randItemName = randItem(ITEM_CATALOG).name;

  return { randItemName };
};

export default SearchPage;
