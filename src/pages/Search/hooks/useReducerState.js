import React from 'react';

import ITEM_CATALOG from 'src/data/items.json';

const randItem = () => ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];

const LocalStorage = {
  Lookup: 'ACNHCatalogLookup--Lookup',
};

export default function useReducerState() {
  const [state, _dispatch] = React.useReducer(reducer, initialState);
  const dispatch = (type, data) => _dispatch({ type, ...data });

  // initialize lookup from local storage
  React.useEffect(() => {
    console.debug('reading', `localStorage[${LocalStorage.Lookup}]`);
    try {
      const parsedLookup = JSON.parse(localStorage.getItem(LocalStorage.Lookup));
      if (parsedLookup.length) {
        console.debug('restoring lookup');
        const initialLookup = new Set(parsedLookup);
        dispatch('init-lookup', { initialLookup });
      } else {
        console.debug('no lookup found');
      }
    } catch (err) {
      console.error('Unable to initialize lookup');
    }
  }, []);

  // write every change to local storage
  React.useEffect(() => {
    // use the init flag to detect whether this is an initial state
    // we shouldn't ever write the initial state (may happen accidentally)
    if (state.init) {
      console.debug('writing', `localStorage[${LocalStorage.Lookup}]`);
      localStorage.setItem(LocalStorage.Lookup, JSON.stringify([...state.lookup]));
    }
  });

  return [state, dispatch];
}

const initialState = {
  // init is false until the user interacts with the lookup catalog
  // prevents accidental writes of initial state of empty catalog
  init: false,

  input: '',
  search: '',
  placeholder: 'Search...',
  typeFilters: new Set(),
  items: new Set(),
  lookup: new Set(),
};

// mutates state passed, use only after cloning state
function resetInputSearch(nextState) {
  // always reset input
  nextState.input = initialState.input;
  nextState.search = initialState.search;
}
function reducer(state, action) {
  const before = { ...state };
  console.debug('useReducerState', { action, before });

  switch (action.type) {
    case 'init-lookup': {
      return {
        ...state,
        placeholder: randItem().name,
        lookup: action.initialLookup,
      };
    }

    case '+item': {
      const nextState = { ...state };

      // add only if not already in lookup
      if (!state.lookup.has(action.id)) {
        const items = new Set(state.items);
        items.add(action.id);
        nextState.items = items;
      }

      // always reset input and search
      resetInputSearch(nextState);

      return nextState;
    }
    case '-item': {
      const items = new Set(state.items);
      items.delete(action.id);
      return { ...state, items };
    }
    case 'buy-item': {
      const items = new Set(state.items);
      items.delete(action.id);

      const lookup = new Set(state.lookup);
      lookup.add(action.id);

      return { ...state, init: true, items, lookup };
    }
    case '-lookup': {
      const lookup = new Set(state.lookup);
      lookup.delete(action.id);

      return { ...state, init: true, lookup };
    }
    case 'reset-items': {
      return {
        ...state,
        items: new Set(),
      };
    }

    case 'input':
      return {
        ...state,
        input: action.value,
      };
    case 'reset-input': {
      const nextState = { ...state };

      // always reset input and search
      resetInputSearch(nextState);

      return nextState;
    }
    case 'search':
      return {
        ...state,
        search: state.input,
      };

    case 'filter': {
      const typeFilters = new Set(state.typeFilters);
      const { filterType } = action;
      if (typeFilters.has(filterType)) {
        typeFilters.delete(filterType);
      } else {
        typeFilters.add(filterType);
      }
      return { ...state, typeFilters };
    }

    default:
      throw new Error(`invalid dispatch: ${JSON.stringify(action)}`);
  }
}
