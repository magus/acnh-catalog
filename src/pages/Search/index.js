import React from 'react';
import styled from 'styled-components';
import _debounce from 'lodash/debounce';
import fuzzysort from 'fuzzysort';

import Item from 'src/components/Item';
import Image from 'src/components/Image';
import Search from 'src/components/icons/Search';
import X from 'src/components/icons/X';
import useKeyboard from 'src/hooks/useKeyboard';
import usePreventZoom from 'src/hooks/usePreventZoom';

import useReducerState from './hooks/useReducerState';
import keyByField from 'utils/keyByField';
import time from 'utils/time';
import TYPES from 'src/data/categories.json';
import ITEM_CATALOG from 'src/data/items.json';

import { GlobalStyle } from './styles.js';

const ITEM_CATALOG_BY_ID = Object.freeze(keyByField(ITEM_CATALOG, 'id'));
const TYPE = Object.freeze(
  TYPES.reduce((_, type) => {
    _[type] = type;
    return _;
  }, {}),
);

const noop = () => {};

const filterItem = (filters) => (item) => (filters.size ? filters.has(item.category) : true);

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

function searchCatalog(fullQuery, filters) {
  const queries = fullQuery.split(/\s/);

  const filteredCatalog = filters.size === 0 ? ITEM_CATALOG : ITEM_CATALOG.filter(filterItem(filters));

  // search against substrings
  const allResults = {};
  queries.forEach((q) => {
    // nameResults
    fuzzysort
      .go(q, filteredCatalog, {
        keys: ['name'],
        // don't return bad results
        threshold: -999,
        limit: 1000,
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
      .go(q, filteredCatalog, {
        keys: ['variant'],
        // don't return bad results
        threshold: -999,
        limit: 1000,
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
  const trimmedResults = sortedResults.slice(0, 20);

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
      ...result.obj,
      originalItem: result.obj,
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
  usePreventZoom();
  const { inputFocusEvents, keyboardPaddingBottom } = useKeyboard();
  const [state, dispatch] = useReducerState();
  const refs = React.useRef({
    input: React.createRef(),
  });

  const { input: inputValue, search, placeholder, filters, wishlist, catalog } = state;

  const debouncedSearch = React.useRef(_debounce(() => dispatch('search'), 100));
  const handleClearAll = () => dispatch('reset-wishlist');
  const addItem = (id) => () => dispatch('+wishlist', { id });
  const deleteItem = (id) => () => dispatch('-wishlist', { id });
  const buyItem = (id) => () => dispatch('+catalog', { id });
  const deleteCatalog = (id) => () => dispatch('-catalog', { id });
  const onFilterClick = (filter) => () => dispatch('filter', { filter });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const input = refs.current.input.current;
      if (input) {
        // ensure input loses focus on search click
        input.blur();
      }
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

  const filteredResults = React.useMemo(() => {
    const searchResults = (search && time('search', () => searchCatalog(search, filters))) || [];
    return searchResults.filter(filterItem(filters));
  }, [search, filters]);

  const renderSearchResults = React.useMemo(() => {
    if (!filteredResults.length) return null;

    return (
      <div id="searchResults" className="items">
        {filteredResults.map((item) => {
          return (
            <Item
              key={item.id}
              item={item.originalItem}
              name={item.name}
              variant={item.variant}
              isCatalog={catalog.has(item.id)}
              onClick={addItem(item.id)}
              onBuy={buyItem(item.id)}
              onDelete={deleteCatalog(item.id)}
            />
          );
        })}
      </div>
    );
  }, [catalog, filteredResults]);

  const pendingItems = React.useMemo(() => {
    const filteredItems = sortedSetList(wishlist).filter(filterItem(filters));

    if (!filteredItems.length) return null;

    return (
      <ItemsContainer>
        <ItemsContainerName>Wishlist</ItemsContainerName>
        <div className="items">
          {filteredItems.map((item, i) => {
            return <Item key={item.id} item={item} pending onBuy={buyItem(item.id)} onDelete={deleteItem(item.id)} />;
          })}
        </div>
      </ItemsContainer>
    );
  }, [wishlist, catalog, filters]);

  const catalogItems = React.useMemo(() => {
    const filteredCatalog = sortedSetList(catalog).filter(filterItem(filters));

    if (!filteredCatalog.length) return null;

    return (
      <ItemsContainer>
        <ItemsContainerName>Catalog</ItemsContainerName>
        <div className="items">
          {filteredCatalog.map((item, i) => {
            return <Item key={item.id} item={item} isCatalog onDelete={deleteCatalog(item.id)} />;
          })}
        </div>
      </ItemsContainer>
    );
  }, [wishlist, catalog, filters]);

  return (
    <div className="container">
      <GlobalStyle />

      <div className="sticky-header">
        <Image alt="animal crossing icon" className="app-icon" src="images/app-icon.3a3ded.svg" />

        <form action="#" className="input">
          <input
            className="transition-colors ease-in-out"
            ref={refs.current.input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            {...inputFocusEvents}
            type="search"
            id="search"
            name="search"
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
            autoCorrect="off"
            autoCapitalize="none"
            value={inputValue}
          />
          {!inputValue ? null : (
            <button className="icon-button input--clear" onClick={handleClear}>
              <X color="#fff" />
            </button>
          )}
          <button onClick={noop} className="icon-button input--search">
            <Search color="#fff" />
          </button>
        </form>

        <Filters>
          {TYPES.map((type) => {
            return (
              <FilterButton key={type} active={filters.has(type)} onClick={onFilterClick(type)}>
                {type}
              </FilterButton>
            );
          })}
        </Filters>
      </div>

      <div className="item-container">
        {/* search results */}
        {renderSearchResults}

        {/* is searching or has no pending items */}
        {inputValue || wishlist.size === 0 ? null : (
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

const Filters = styled.div`
  margin: 8px 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
`;

const FilterButton = styled.button`
  margin: 0 4px 4px 0;
  font-size: 16px;
  padding: 4px 2px;
  height: auto;
  background-color: var(--button-color);
  color: var(--font-color);
  opacity: ${(props) => props.active || 0.4};
  color: ${(props) => (props.active ? 'var(--button-color)' : 'var(--font-color)')};
  background-color: ${(props) => (props.active ? 'var(--font-color)' : 'var(--button-color)')};
`;

const ItemsContainer = styled.div`
  width: 100%;
`;

const ItemsContainerName = styled.div`
  font-weight: 800;
`;
