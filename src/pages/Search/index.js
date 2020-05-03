import React from 'react';
import _debounce from 'lodash/debounce';
import fuzzysort from 'fuzzysort';

import Item from 'src/components/Item';
import Image from 'src/components/Image';
import useKeyboard from 'src/hooks/useKeyboard';

import useReducerState from './hooks/useReducerState';
import keyByField from 'utils/keyByField';
import time from 'utils/time';
import TYPES from './data/types.json';
import ITEM_CATALOG from './data/item-variants-catalog.json';

import { GlobalStyle } from './styles.js';

const ITEM_CATALOG_BY_ID = Object.freeze(keyByField(ITEM_CATALOG, 'id'));
const TYPE = Object.freeze(
  TYPES.reduce((_, type) => {
    _[type] = type;
    return _;
  }, {}),
);

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

  const getEitherMatchResult = (_) => _.name[0] || _.variant[0];

  const sortedResults = Object.values(allResults).sort((a, b) => {
    const combinedMatches = (_) => _.name.length + _.variant.length;
    const nameMatches = (_) => _.name.length;
    const highestScore = (_) => Math.max(...[..._.name.map((n) => n.score), ..._.variant.map((n) => n.score)]);
    const sortName = (_) => {
      const item = getEitherMatchResult(_).obj;
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

  // convert to format for use in render etc.
  return trimmedResults.map((combinedResult) => {
    const result = getEitherMatchResult(combinedResult);

    if (!result) return null;

    // e.g.
    // {
    //   item: {
    //     id: 273,
    //     name: '3d glasses',
    //     variant: 'white',
    //     type: 'accessory',
    //   },
    //   name: '3d <b>gla</b>sses',
    //   variant: '<b>w</b>hite',
    //   combinedResult: { name: [ ... ], variant: [ ... ] },
    // }
    const customSearchResult = {
      item: result.obj,
      combinedResult,
    };

    // build search highlight html
    if (combinedResult.name.length) {
      combinedResult.name[0].indexes = [...combinedResult.name.map((_) => _.indexes)].flat();
      customSearchResult.name = fuzzysort.highlight(combinedResult.name[0], '<b>', '</b>');
    }

    if (combinedResult.variant.length) {
      combinedResult.variant[0].indexes = [...combinedResult.variant.map((_) => _.indexes)].flat();
      customSearchResult.variant = fuzzysort.highlight(combinedResult.variant[0], '<b>', '</b>');
    }

    return customSearchResult;
  });
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
      addItem(firstMatch.item.id)();
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

        <div className="typeFilters">
          {TYPES.map((type) => (
            <button>{type}</button>
          ))}
        </div>
      </div>

      <div className="item-container">
        {/* search results */}
        <div id="searchResults" className="items">
          {filteredResults.map((result) => {
            if (!result) return null;

            const { id } = result.item;

            return (
              <Item
                key={id}
                item={result.item}
                name={result.name}
                variant={result.variant}
                isCatalog={lookup.has(id)}
                onClick={addItem(id)}
                onBuy={buyItem(id)}
                onDelete={deleteCatalog(id)}
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
    </div>
  );
}

export default App;
