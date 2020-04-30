import React from 'react';
import fuzzysort from 'fuzzysort';

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
        allResults[result.obj.id].name.push(
          JSON.parse(JSON.stringify(result[0])),
        );
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
        allResults[result.obj.id].variant.push(
          JSON.parse(JSON.stringify(result[0])),
        );
      });
  });

  const sortedResults = Object.values(allResults).sort((a, b) => {
    const combinedMatches = (_) => _.name.length + _.variant.length;
    const highestScore = (_) =>
      Math.max(
        ...[..._.name.map((n) => n.score), ..._.variant.map((n) => n.score)],
      );

    if (combinedMatches(a) > combinedMatches(b)) return -1;
    if (combinedMatches(a) < combinedMatches(b)) return +1;

    // if matches same, use highest score
    if (combinedMatches(a) === combinedMatches(b)) {
      if (highestScore(a) > highestScore(b)) return -1;
      if (highestScore(a) < highestScore(b)) return +1;
    }

    return 0;
  });

  return sortedResults.slice(0, 20);
}

function App() {
  const [state, dispatch] = useReducerState();
  const refs = React.useRef({
    input: React.createRef(),
  });

  const { input: inputValue, items, lookup } = state;

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
    dispatch('input', { value });
  };

  const handleClear = () => {
    dispatch('reset-input');

    const input = refs.current.input.current;
    if (input) {
      // ensure input has focus after clearing
      input.focus();
    }
  };

  const filteredResults = time(
    () => (inputValue && searchCatalog(inputValue)) || [],
  );

  const pendingItems = React.useMemo(() => {
    return (
      <div className="items">
        {sortedSetList(items).map((item, i) => {
          return (
            <Item
              key={item.id}
              item={item}
              pending
              onBuy={buyItem(item.id)}
              onDelete={deleteItem(item.id)}
            />
          );
        })}
      </div>
    );
  }, [items, lookup]);

  const catalogItems = React.useMemo(() => {
    return (
      <div className="items">
        {sortedSetList(lookup).map((item, i) => {
          return (
            <Item
              key={item.id}
              item={item}
              isCatalog
              onDelete={deleteCatalog(item.id)}
            />
          );
        })}
      </div>
    );
  }, [items, lookup]);

  return (
    <div className="container">
      <GlobalStyle />

      <img
        alt="animal crossing icon"
        className="app-icon"
        src="images/app-icon.png"
      />

      <div className="input">
        <input
          className="transition-colors ease-in-out"
          ref={refs.current.input}
          onKeyDown={handleKeyDown(filteredResults[0])}
          onChange={handleInputChange}
          type="search"
          autoComplete="off"
          spellCheck="false"
          placeholder="Type to lookup items..."
          autoCorrect="off"
          autoCapitalize="none"
          value={inputValue}
        />

        <button onClick={handleClear}>clear</button>

        <div id="searchResults" className="items">
          {filteredResults.map((combinedResult) => {
            const result = combinedResult.name[0] || combinedResult.variant[0];

            if (!result) return null;

            let hName;
            let hVariant;
            if (combinedResult.name.length) {
              combinedResult.name[0].indexes = [
                ...combinedResult.name.map((_) => _.indexes),
              ].flat();

              hName = fuzzysort.highlight(
                combinedResult.name[0],
                '<b>',
                '</b>',
              );
            }

            if (combinedResult.variant.length) {
              combinedResult.variant[0].indexes = [
                ...combinedResult.variant.map((_) => _.indexes),
              ].flat();
              hVariant = fuzzysort.highlight(
                combinedResult.variant[0],
                '<b>',
                '</b>',
              );
            }

            console.debug(hName, hVariant, result);

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
      </div>

      {/* is searching or has no pending items */}
      {inputValue || items.size === 0 ? null : (
        <button className="clear" onClick={handleClearAll}>
          clear all
        </button>
      )}

      {inputValue ? null : (
        <>
          {pendingItems}
          {catalogItems}
        </>
      )}
    </div>
  );
}

function Item({
  item,
  name,
  variant,
  isCatalog,
  pending,
  onClick,
  onBuy,
  onDelete,
}) {
  const deleteButton = (pending || isCatalog) && (
    <button onClick={onDelete}>
      <span role="img" aria-label="delete">
        ❌
      </span>
    </button>
  );

  const buyButton = (pending || !isCatalog) && (
    <button onClick={onBuy}>
      <span role="img" aria-label="buy" className="item-actions--buy" />
    </button>
  );

  const _name = name || item.name;
  const _variant = variant || item.variant;

  return (
    <div key={item.id} className="item" onClick={onClick}>
      <div className="item-name">
        <span dangerouslySetInnerHTML={{ __html: _name }} />
        <span
          dangerouslySetInnerHTML={{
            __html: !_variant ? '' : ` (${_variant})`,
          }}
        />
      </div>
      <div className="item-actions">
        {deleteButton}
        {buyButton}
      </div>
    </div>
  );
}

export default App;
