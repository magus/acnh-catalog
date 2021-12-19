import React from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import _debounce from 'lodash/debounce';
import fuzzysort from 'fuzzysort';
import { AnimateSharedLayout, AnimatePresence, motion } from 'framer-motion';

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

const noop = () => {};

const filterItem = (filters) => (item) => (filters.size ? filters.has(item.category) : true);

function sortedSetList(set, ITEM_CATALOG) {
  if (!ITEM_CATALOG) return [];

  return (
    // convert set to array
    [...set]
      // hydrate ids into items
      .map((id) => ITEM_CATALOG.lookup[id])
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

function searchCatalog(fullQuery, filters, items) {
  const queries = fullQuery.split(/\s/);

  const filteredCatalog = filters.size === 0 ? items : items.filter(filterItem(filters));

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

export default function SearchPage(props) {
  const analytics = useGoogleAnalytics();
  const { inputFocusEvents, keyboardPaddingBottom } = useKeyboard();
  const modal = React.useContext(ModalProvider.Context);

  const [isInitLogExited, didInitLogExit] = React.useState(false);
  const [hideLoadingBar, removeLoadingBar] = React.useState(false);
  const [ITEM_CATALOG, setItemCatalog] = React.useState(null);

  const [state, dispatch] = useReducerState(props);
  const refs = React.useRef({
    input: React.createRef(),
  });

  const {
    initialized,
    initializedLog,
    loadPercent,
    input: inputValue,
    search,
    placeholder,
    filters,
    wishlist,
    catalog,
  } = state;

  // on mount
  React.useEffect(() => {
    dispatch('+init-log', { log: 'Downloading item catalog...' });
    fetch('data/2021-12-19-items.json')
      .then((resp) => resp.json())
      .then((items) => {
        // save item catalog
        setItemCatalog({ items, lookup: Object.freeze(keyByField(items, 'id')) });

        // once we have catalog, initialize search
        time('search', () => searchCatalog('f', filters, items));
        dispatch('init-search');
      });
  }, []);

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
      const timed = time('search', () => searchCatalog(search, filters, ITEM_CATALOG.items));

      analytics.event('search', {
        category: 'search',
        label: `${search} (${[...filters].join('-') || 'all'})`,
        value: Math.round(timed.elapsedMs),
      });

      return timed.result;
    }

    return [];
  }, [search, filters, ITEM_CATALOG]);

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
    const filteredItems = sortedSetList(wishlist, ITEM_CATALOG).filter(filterItem(filters));

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
  }, [wishlist, catalog, filters, ITEM_CATALOG]);

  const catalogItems = React.useMemo(() => {
    const filteredCatalog = sortedSetList(catalog, ITEM_CATALOG).filter(filterItem(filters));

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
  }, [wishlist, catalog, filters, ITEM_CATALOG]);

  return (
    <>
      <div className="sticky-header">
        <AnimatePresence>
          {hideLoadingBar ? null : (
            <motion.div exit={{ opacity: 0 }}>
              <LoadingBarContainer>
                <LoadingBarProgress
                  onAnimationComplete={() => {
                    if (loadPercent === 100) {
                      removeLoadingBar(true);
                    }
                  }}
                  transition={{
                    duration: loadPercent === 100 ? 0.25 : 1,
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: `${-100 + loadPercent / 2}%` }}
                />
              </LoadingBarContainer>
            </motion.div>
          )}
        </AnimatePresence>

        <Image alt="animal crossing icon" className="app-icon" src="images/app-icon.3a3ded.svg" />

        <InputContainer
          initial={{ opacity: 0 }}
          animate={initialized ? { opacity: 1 } : undefined}
          isHidden={!initialized}
        >
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
        </InputContainer>
      </div>

      <AnimatePresence onExitComplete={() => didInitLogExit(true)}>
        {initialized ? null : (
          <InitLog animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!initializedLog[0] ? null : (
              <InitLogRow error={initializedLog[0].error}>
                <InitLogRowText active={false} dangerouslySetInnerHTML={{ __html: initializedLog[0].log }} />
              </InitLogRow>
            )}
            {initializedLog.slice(1).map((row, i) => (
              <InitLogRowTyper key={i} row={row} active={i === initializedLog.length - 1} duration={500} />
            ))}
          </InitLog>
        )}
      </AnimatePresence>

      {!isInitLogExited ? null : (
        <>
          {/* search results */}
          {renderSearchResults}

          {inputValue ? null : (
            <>
              {wishlistItems}
              {catalogItems}
            </>
          )}
        </>
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

const InitLog = styled(motion.div)`
  margin: 0 24px;
  display: flex;
  flex-direction: column;
  height: calc(36px * 10);
  max-height: 100%;
`;

const InitLogRow = styled.div`
  height: 36px;
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

const InitLogRowText = styled.div`
  display: inline-block;
  padding: 0 0.15em 0 0;
  letter-spacing: 0.15em;
  border-right: ${(props) => (!props.active ? 'none' : '0.15em solid var(--app-color)')};
  animation: ${(props) => (!props.active ? 'none' : 'blink-caret 0.75s step-end infinite')};

  /* The typewriter cursor effect */
  @keyframes blink-caret {
    from,
    to {
      border-color: transparent;
    }
    50% {
      border-color: var(--app-color);
    }
  }
`;

const InputContainer = styled(motion.div)`
  width: 100%;
  pointer-events: ${(props) => (props.isHidden ? 'none' : 'all')};
`;

function InitLogRowTyper({ row, active, duration }) {
  const [typed, setTyped] = React.useState(0);

  React.useEffect(() => {
    const interval = duration / row.log.length;
    let timeoutId;
    let _typed = 0;

    function typeCharacter() {
      const nextTyped = ++_typed;
      if (nextTyped <= row.log.length) {
        setTyped(nextTyped);
      }
      timeoutId = setTimeout(typeCharacter, interval);
    }

    typeCharacter();

    return function cleanup() {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <InitLogRow error={row.error}>
      <InitLogRowText active={active} dangerouslySetInnerHTML={{ __html: row.log.slice(0, typed) }} />
    </InitLogRow>
  );
}

const LoadingBarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  height: 4px;
  width: 100%;
`;

const LoadingBarProgress = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  background: green;
  height: 4px;
  width: 200%;
`;
