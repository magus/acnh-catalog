import React from 'react';
import styled from 'styled-components';
import _debounce from 'lodash/debounce';
import fuzzysort from 'fuzzysort';

import ModalProvider from 'src/components/ModalProvider';
import Filters from 'src/components/Filters';
import NoResults from 'src/components/NoResults';
import Item from 'src/components/Item';
import Image from 'src/components/Image';
import Search from 'src/components/icons/Search';
import X from 'src/components/icons/X';
import CatalogIcon from 'src/components/icons/CatalogIcon';
import WishlistIcon from 'src/components/icons/Wishlist';
import useKeyboard from 'src/hooks/useKeyboard';
import useGoogleAnalytics from 'src/hooks/useGoogleAnalytics';

import useReducerState from './hooks/useReducerState';
import keyByField from 'src/utils/keyByField';
import time from 'src/utils/time';

import ITEM_CATALOG from 'src/data/items.json';

const ITEM_CATALOG_BY_ID = Object.freeze(keyByField(ITEM_CATALOG, 'id'));

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
    const highlightOpen = '<span class="searchResult-highlight">';
    const highlightClose = '</span>';

    if (combinedResult.name.length) {
      combinedResult.name[0].indexes = [...combinedResult.name.map((_) => _.indexes)].flat();
      customSearchResult.name = fuzzysort.highlight(combinedResult.name[0], highlightOpen, highlightClose);
    }

    if (combinedResult.variant.length) {
      combinedResult.variant[0].indexes = [...combinedResult.variant.map((_) => _.indexes)].flat();
      customSearchResult.variant = fuzzysort.highlight(combinedResult.variant[0], highlightOpen, highlightClose);
    }

    return customSearchResult;
  });
}

export default function App() {
  const analytics = useGoogleAnalytics();
  const { inputFocusEvents, keyboardPaddingBottom } = useKeyboard();
  const modal = React.useContext(ModalProvider.Context);
  const [state, dispatch] = useReducerState();
  const refs = React.useRef({
    input: React.createRef(),
  });

  // on mount
  React.useEffect(() => {
    // initialize search by warming query engine
    time('search', () => searchCatalog('f', filters));
    dispatch('init-search');
  }, []);

  const { initialized, initializedLog, input: inputValue, search, placeholder, filters, wishlist, catalog } = state;

  const debouncedSearch = React.useRef(_debounce(() => dispatch('search'), 100));
  const handleClearAll = (type) => () => {
    const reset = () => dispatch(type === 'WISHLIST' ? 'reset-wishlist' : 'reset-catalog');

    modal.openModal({
      title: `Clear ${type}?`,
      message: (
        <>
          <span>
            Are you sure you really want to delete your entire <b>{type}</b>?
          </span>
          <br />
          <br />
          <span>
            <b>{type}</b> cannot be restored once deleted.
          </span>
        </>
      ),
      buttons: [
        { text: 'Cancel', subtle: true, dismiss: true, onClick: () => console.warn('Cancel') },
        { text: 'Clear', wait: 3, dismiss: true, onClick: reset },
      ],
    });
  };
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
    if (search) {
      const timed = time('search', () => searchCatalog(search, filters));

      analytics.event('search', {
        category: 'search',
        label: `${search} (${[...filters].join('-') || 'all'})`,
        value: Math.round(timed.elapsedMs),
      });

      return timed.result;
    }

    return [];
  }, [search, filters]);

  const buildItemProps = (item) => ({
    isCatalog: catalog.has(item.id),
    isWishlist: wishlist.has(item.id),
    onWislist: wishlist.has(item.id) ? deleteItem(item.id) : addItem(item.id),
    onCatalog: catalog.has(item.id) ? deleteCatalog(item.id) : buyItem(item.id),
  });

  const renderSearchResults = React.useMemo(() => {
    if (!search) return null;

    if (!filteredResults.length) {
      return <NoResults />;
    }

    return (
      <div id="searchResults" className="items">
        {filteredResults.map((item) => {
          return (
            <Item
              key={item.id}
              item={item.originalItem}
              name={item.name}
              variant={item.variant}
              isSearch
              {...buildItemProps(item)}
            />
          );
        })}
      </div>
    );
  }, [catalog, wishlist, filteredResults]);

  const wishlistItems = React.useMemo(() => {
    const filteredItems = sortedSetList(wishlist).filter(filterItem(filters));

    const items = !filteredItems.length ? (
      <NoResults empty={!search} />
    ) : (
      <>
        <div className="items">
          {filteredItems.map((item, i) => {
            return <Item key={item.id} item={item} {...buildItemProps(item)} />;
          })}
        </div>

        <ClearAllButton className="clear-all" onClick={handleClearAll('WISHLIST')}>
          Clear Wishlist
        </ClearAllButton>
      </>
    );

    return (
      <ItemsContainer>
        <ItemsContainerName>
          <WishlistIcon active /> {`Wishlist (${filteredItems.length})`}
        </ItemsContainerName>
        {items}
      </ItemsContainer>
    );
  }, [wishlist, catalog, filters]);

  const catalogItems = React.useMemo(() => {
    const filteredCatalog = sortedSetList(catalog).filter(filterItem(filters));

    const items = !filteredCatalog.length ? (
      <NoResults />
    ) : (
      <>
        <div className="items">
          {filteredCatalog.map((item, i) => {
            return <Item key={item.id} item={item} {...buildItemProps(item)} />;
          })}
        </div>

        <ClearAllButton className="clear-all" onClick={handleClearAll('CATALOG')}>
          Clear Catalog
        </ClearAllButton>
      </>
    );

    return (
      <ItemsContainer>
        <ItemsContainerName>
          <CatalogIcon active /> {`Catalog (${filteredCatalog.length})`}
        </ItemsContainerName>
        {items}
      </ItemsContainer>
    );
  }, [wishlist, catalog, filters]);

  return (
    <>
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

        <Filters filters={filters} onFilterClick={onFilterClick} />
      </div>

      {!initialized ? (
        <InitLog>
          {initializedLog.map((row, i) => (
            <InitLogRow key={i} error={row.error} dangerouslySetInnerHTML={{ __html: row.log }} />
          ))}
        </InitLog>
      ) : (
        <div className="item-container">
          {/* search results */}
          {renderSearchResults}

          {inputValue ? null : (
            <>
              {wishlistItems}
              {catalogItems}
            </>
          )}
        </div>
      )}

      {/* handle keyboard and padding to allow scrolling entire view */}
      <div style={{ height: 1, width: 1, ...keyboardPaddingBottom }} />
    </>
  );
}

const ItemsContainer = styled.div`
  margin: 40px 0 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ItemsContainerName = styled.div`
  margin: 0 0 16px 0;
  font-weight: 800;
  align-items: center;
  display: flex;

  img,
  svg {
    width: 32px;
  }
`;

const ClearAllButton = styled.button`
  align-self: flex-end;
`;

const InitLog = styled.div`
  margin: 24px;
  display: flex;
  flex-direction: column;
`;

const InitLogRow = styled.div`
  padding: 8px 16px;
  border-color: ${(props) => (props.error ? 'var(--error-color)' : 'var(--app-color)')};
  border-style: solid;
  border-width: 0;
  border-left-width: 1px;
  font-weight: 200;

  b {
    font-weight: 800;
    color: var(--app-color);
  }
`;
