import React from 'react';

import ITEM_CATALOG from 'src/data/items.json';
import keyMirror from 'src/utils/keyMirror';

const randItem = () => ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];

const LOCAL_STORAGE_KEY = 'ACNHCatalog--State';

const VERSION = keyMirror({
  // {
  //   lookup: [1, 2, ...],
  // }
  v1: true,

  // {
  //   catalog: [1, 2, ...],
  //   wishlist: [1, 2, ...],
  // }
  v2: true,
});

// once a version releases, previous versions must all be updated
// to mutate from their stored schema to latest version
const RestoreState = {
  // v1 -> v2
  [VERSION.v1]: (storedState) => {
    return {
      catalog: new Set(storedState.lookup),
    };
  },

  // v2 -> v2 (noop)
  [VERSION.v2]: (storedState) => {
    return {
      catalog: new Set(storedState.catalog),
      wishlist: new Set(storedState.wishlist),
    };
  },
};

// All stored state must have a version which maps to storage key
// We only need to maintain one version of this function since all
// versions will write only the latest version to the store.
// Migration strategies above will enforce all previous state can
// migrate to the latest version properly.
function buildStoredState(state) {
  const storedState = {
    version: VERSION.v2,
  };

  storedState.catalog = [...state.catalog];
  storedState.wishlist = [...state.wishlist];

  return JSON.stringify(storedState);
}

export default function useReducerState() {
  const [state, _dispatch] = React.useReducer(reducer, initialState);
  const dispatch = (type, data) => _dispatch({ type, ...data });

  // initialize lookup from local storage
  React.useEffect(() => {
    console.debug('reading', `localStorage[${LOCAL_STORAGE_KEY}]`);
    try {
      const storedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedRaw) {
        console.debug('No stored data');
      } else {
        const storedState = JSON.parse(storedRaw);
        if (!storedState) {
          console.debug('Invalid stored data');
        } else {
          const restoreState = RestoreState[storedState.version];
          if (!restoreState) {
            console.debug('Missing restore state function', storedState.version);
          } else {
            const restoredState = restoreState(storedState);
            console.debug(storedState.version, 'state migrated successfully');

            // dispatch state with init-lookup
            dispatch('restoreState', { restoredState });
          }
        }
      }
    } catch (err) {
      console.debug('Failed to initialize from localStorage', err);
    }
  }, []);

  // write every change to local storage
  React.useEffect(() => {
    // use the init flag to detect whether this is an initial state
    // we shouldn't ever write the initial state (may happen accidentally)
    if (state.init) {
      console.debug('writing', `localStorage[${LOCAL_STORAGE_KEY}]`);
      localStorage.setItem(LOCAL_STORAGE_KEY, buildStoredState(state));
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
  filters: new Set(),
  wishlist: new Set(),
  catalog: new Set(),
};

// mutates state passed, use only after cloning state
function resetInputSearch(nextState) {
  // always reset input
  nextState.input = initialState.input;
  nextState.search = initialState.search;
}

function reducer(state, action) {
  const before = { ...state };
  console.debug('useReducerState', action.type, { action, before });

  switch (action.type) {
    case 'restoreState': {
      return {
        ...state,
        ...action.restoredState,
        placeholder: randItem().name,
      };
    }

    case '+wishlist': {
      const nextState = { ...state, init: true };

      // add only if not already in lookup
      if (!state.catalog.has(action.id)) {
        const wishlist = new Set(state.wishlist);
        wishlist.add(action.id);
        nextState.wishlist = wishlist;
      }

      // always reset input and search
      resetInputSearch(nextState);

      return nextState;
    }
    case '-wishlist': {
      const wishlist = new Set(state.wishlist);
      wishlist.delete(action.id);
      return { ...state, init: true, wishlist };
    }
    case '+catalog': {
      const nextState = { ...state, init: true };
      const wishlist = new Set(state.wishlist);
      wishlist.delete(action.id);
      nextState.wishlist = wishlist;

      const catalog = new Set(state.catalog);
      catalog.add(action.id);
      nextState.catalog = catalog;

      // always reset input and search
      resetInputSearch(nextState);

      return nextState;
    }
    case '-catalog': {
      const catalog = new Set(state.catalog);
      catalog.delete(action.id);

      return { ...state, init: true, catalog };
    }
    case 'reset-wishlist': {
      return {
        ...state,
        init: true,
        wishlist: new Set(),
      };
    }
    case 'reset-catalog': {
      return {
        ...state,
        init: true,
        catalog: new Set(),
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
      const filters = new Set(state.filters);
      const { filter } = action;
      if (filters.has(filter)) {
        filters.delete(filter);
      } else {
        filters.add(filter);
      }
      return { ...state, filters };
    }

    default:
      throw new Error(`invalid dispatch: ${JSON.stringify(action)}`);
  }
}
