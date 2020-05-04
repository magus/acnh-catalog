import React from 'react';

import ITEM_CATALOG from 'src/data/items.json';
import keyMirror from 'src/utils/keyMirror';

const randItem = () => ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];

const LOCAL_STORAGE_KEY = 'ACNHCatalog--State';

const VERSION = keyMirror({
  v1: true,
  v2: true,
});

const MigrationStrategy = {
  // no-op this is the first version
  // once a v2 releases, v1 will read in a state and mutate it to v2, if necessary
  // etc. etc.
  [VERSION.v1]: (storedState) => {
    return {
      lookup: new Set(storedState.lookup),
    };
  },
  [VERSION.v2]: (state) => state,
};

// All stored state must have a version which maps to storage key
// We only need to maintain one version of this function since all
// versions will write only the latest version to the store.
// Migration strategies above will enforce all previous state can
// migrate to the latest version properly.
function buildStoredState(state) {
  const storedState = {
    version: VERSION.v1,
  };

  storedState.lookup = [...state.lookup];

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
          const migrationStrategy = MigrationStrategy[storedState.version];
          if (!migrationStrategy) {
            console.debug('Missing migration strategy', storedState.version);
          } else {
            const migratedState = migrationStrategy(storedState);
            console.debug(storedState.version, 'state migrated successfully');

            // dispatch state with init-lookup
            dispatch('init-lookup', { migratedState });
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
        ...action.migratedState,
        placeholder: randItem().name,
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
