import React from 'react';
import _debounce from 'lodash/debounce';
import fuzzysort from 'fuzzysort';

import Item from 'src/components/Item';
import Image from 'src/components/Image';
import useKeyboard from 'src/hooks/useKeyboard';

import useReducerState from './hooks/useReducerState';
import keyByField from 'utils/keyByField';
import time from 'utils/time';
import ITEM_CATALOG from './data/item-variants-catalog.json';

import { GlobalStyle } from './styles.js';

const ITEM_CATALOG_BY_ID = keyByField(ITEM_CATALOG, 'id');

function sortedSetList(set) {
  return (
    // convert set to array
    [...set]
      // hydrate ids into items
      .map((id) => ITEM_CATALOG_BY_ID[id])
      // sort by name

      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return +1;
        }

        return 0;
      })
  );
}

function searchCatalog(fullQuery) {
  const queries = fullQuery.split(/\s/);

  // search against substrings
  const allResults = {};
  queries.forEach((q) => {
    // nameResults
    fuzzysort
      .go(q, ITEM_CATALOG, {
        keys: ['name'],
        // don't return bad results
        threshold: -999,
        limit: 200,
      })
      .forEach((result) => {
        if (!allResults[result.obj.id]) {
          allResults[result.obj.id] = { name: [], variant: [] };
        }

        result[0].query = q;
        result[0].obj = result.obj;
        allResults[result.obj.id].name.push(JSON.parse(JSON.stringify(result[0])));
      });

    // variantResults
    fuzzysort
      .go(q, ITEM_CATALOG, {
        keys: ['variant'],
        // don't return bad results
        threshold: -999,
        limit: 200,
      })
      .forEach((result) => {
        if (!allResults[result.obj.id]) {
          allResults[result.obj.id] = { name: [], variant: [] };
        }

        result[0].query = q;
        result[0].obj = result.obj;
        allResults[result.obj.id].variant.push(JSON.parse(JSON.stringify(result[0])));
      });
  });

  const sortedResults = Object.values(allResults).sort((a, b) => {
    const combinedMatches = (_) => _.name.length + _.variant.length;
    const nameMatches = (_) => _.name.length;
    const highestScore = (_) => Math.max(...[..._.name.map((n) => n.score), ..._.variant.map((n) => n.score)]);
    const sortName = (_) => {
      const eitherResult = _.name[0] || _.variant[0];
      const item = eitherResult.obj;
      return `${item.name}${item.variant || ''}`;
    };

    if (combinedMatches(a) > combinedMatches(b)) return -1;
    if (combinedMatches(a) < combinedMatches(b)) return +1;

    // if count of matches same, use name matches
    if (nameMatches(a) > nameMatches(b)) return -1;
    if (nameMatches(a) < nameMatches(b)) return +1;

    // if name matches are same, use highest score
    if (highestScore(a) > highestScore(b)) return -1;
    if (highestScore(a) < highestScore(b)) return +1;

    // if same scores, use alpha
    if (sortName(a) < sortName(b)) return -1;
    if (sortName(a) > sortName(b)) return +1;

    return 0;
  });

  // trim results to top 20
  const trimmedResults = sortedResults.slice(0, 10);

  return trimmedResults;
}

function App() {
  const { inputFocusEvents, keyboardPaddingBottom } = useKeyboard();
  const [state, dispatch] = useReducerState();
  const refs = React.useRef({
    input: React.createRef(),
  });

  const { input: inputValue, search, items, lookup } = state;

  const debouncedSearch = React.useRef(_debounce(() => dispatch('search'), 100));
  const handleClearAll = () => dispatch('reset-items');
  const addItem = (id) => () => dispatch('+item', { id });
  const buyItem = (id) => () => dispatch('buy-item', { id });
  const deleteItem = (id) => () => dispatch('-item', { id });
  const deleteCatalog = (id) => () => dispatch('-lookup', { id });

  const handleKeyDown = (firstMatch) => (e) => {
    if (e.key === 'Enter' && firstMatch) {
      // dispatch first matching result id, if any
      addItem(firstMatch.obj.id)();
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;

    // keep input up to date
    dispatch('input', { value });

    // debounced search on input value changes
    if (value) {
      debouncedSearch.current();
    } else {
      // clear the input/search if there is no value
      dispatch('reset-input');
    }
  };

  const handleClear = () => {
    dispatch('reset-input');

    const input = refs.current.input.current;
    if (input) {
      // ensure input has focus after clearing
      input.focus();
    }
  };

  const filteredResults = (search && time('search', () => searchCatalog(search))) || [];

  const pendingItems = React.useMemo(() => {
    return (
      <div className="items">
        {sortedSetList(items).map((item, i) => {
          return <Item key={item.id} item={item} pending onBuy={buyItem(item.id)} onDelete={deleteItem(item.id)} />;
        })}
      </div>
    );
  }, [items, lookup]);

  const catalogItems = React.useMemo(() => {
    return (
      <div className="items">
        {sortedSetList(lookup).map((item, i) => {
          return <Item key={item.id} item={item} isCatalog onDelete={deleteCatalog(item.id)} />;
        })}
      </div>
    );
  }, [items, lookup]);

  return (
    <div className="container">
      <GlobalStyle />

      <div className="item-container">
        {/* search results */}
        <div id="searchResults" className="items">
          {filteredResults.map((combinedResult) => {
            const result = combinedResult.name[0] || combinedResult.variant[0];

            if (!result) return null;

            let hName;
            let hVariant;
            if (combinedResult.name.length) {
              combinedResult.name[0].indexes = [...combinedResult.name.map((_) => _.indexes)].flat();

              hName = fuzzysort.highlight(combinedResult.name[0], '<b>', '</b>');
            }

            if (combinedResult.variant.length) {
              combinedResult.variant[0].indexes = [...combinedResult.variant.map((_) => _.indexes)].flat();
              hVariant = fuzzysort.highlight(combinedResult.variant[0], '<b>', '</b>');
            }

            return (
              <Item
                key={result.obj.id}
                item={result.obj}
                name={hName}
                variant={hVariant}
                isCatalog={lookup.has(result.obj.id)}
                onClick={addItem(result.obj.id)}
                onBuy={buyItem(result.obj.id)}
                onDelete={deleteCatalog(result.obj.id)}
              />
            );
          })}
        </div>

        {/* is searching or has no pending items */}
        {inputValue || items.size === 0 ? null : (
          <button className="clear-all" onClick={handleClearAll}>
            clear all
          </button>
        )}

        {inputValue ? null : (
          <>
            {pendingItems}
            {catalogItems}
          </>
        )}

        <div style={{ height: 1, width: 1, ...keyboardPaddingBottom }} />
      </div>

      <div className="sticky-header">
        <Image alt="animal crossing icon" className="app-icon" src="images/app-icon.png" />
        <div className="input">
          <input
            className="transition-colors ease-in-out"
            ref={refs.current.input}
            onKeyDown={handleKeyDown(filteredResults[0])}
            onChange={handleInputChange}
            {...inputFocusEvents}
            type="search"
            autoComplete="off"
            spellCheck="false"
            placeholder="Search..."
            autoCorrect="off"
            autoCapitalize="none"
            value={inputValue}
          />

          <button onClick={handleClear}>clear</button>
        </div>
      </div>
    </div>
  );
}

export default App;
