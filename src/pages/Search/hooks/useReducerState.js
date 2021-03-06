import React from 'react';

import keyMirror from 'src/utils/keyMirror';

const sleep = async (timeMs) => new Promise((resolve) => setTimeout(resolve, timeMs));

const LOG_DELAY = 500;

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

  // no-op from v2, but changed item database (acnh-spreadsheet)
  v3: true,
});

const CURRENT_VERSION = VERSION.v3;

// once a version releases, previous versions must all be updated
// to mutate from their stored schema to latest version
const RestoreState = {
  // v1 -> v3
  [VERSION.v1]: (storedState) => {
    return {
      catalog: new Set(storedState.lookup),
    };
  },

  // v2 -> v3 (noop)
  [VERSION.v2]: (storedState) => {
    return {
      catalog: new Set(storedState.catalog),
      wishlist: new Set(storedState.wishlist),
    };
  },

  // v3 -> v3 (noop)
  [VERSION.v3]: (storedState) => {
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
    version: CURRENT_VERSION,
  };

  storedState.catalog = [...state.catalog];
  storedState.wishlist = [...state.wishlist];

  return JSON.stringify(storedState);
}

export default function useReducerState(props) {
  const [state, _dispatch] = React.useReducer(reducer, { ...initialState, placeholder: props.randItemName });
  const dispatch = (type, data) => _dispatch({ type, ...data });

  // initialize lookup from local storage
  React.useEffect(() => {
    async function main() {
      console.debug('reading', `localStorage[${LOCAL_STORAGE_KEY}]`);
      await sleep(LOG_DELAY);

      try {
        const storedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!storedRaw) {
          dispatch('+init-log', { log: 'No stored data found.' });
          await sleep(LOG_DELAY);
          console.debug('No stored data');
        } else {
          const storedState = JSON.parse(storedRaw);
          if (!storedState) {
            console.debug('Invalid stored data');
          } else {
            dispatch('+init-log', { log: 'Loading saved data...' });
            await sleep(LOG_DELAY);
            const restoreState = RestoreState[storedState.version];
            if (!restoreState) {
              dispatch('+init-log', { log: `Cannot load <b>${storedState.version}</b> state`, error: true });
              await sleep(LOG_DELAY);
              throw new Error(`Missing restore state function ${storedState.version}`);
            } else {
              const restoredState = restoreState(storedState);
              dispatch('+init-log', { log: `Loaded <b>${storedState.version}</b> state!` });
              await sleep(LOG_DELAY);
              console.debug(storedState.version, 'state migrated successfully');

              // dispatch state with init-lookup
              dispatch('restoreState', { restoredState });
            }
          }
        }

        // give some time for user to read logs
        dispatch('+init-log', { log: 'Launching...' });
        await sleep(LOG_DELAY);
        dispatch('init');
      } catch (err) {
        dispatch('+init-log', { log: 'Unable to read stored state.', error: true });
        await sleep(LOG_DELAY);
        dispatch('+init-log', { log: err.message, error: true });
        await sleep(LOG_DELAY);
        console.error('Unable to read stored state', err);
      }
    }

    main();
  }, []);

  // write every change to local storage
  React.useEffect(() => {
    // use the write flag to detect whether this is an initial state
    // we shouldn't ever write the initial state (may happen accidentally)
    if (state.write) {
      console.debug('writing', `localStorage[${LOCAL_STORAGE_KEY}]`);
      localStorage.setItem(LOCAL_STORAGE_KEY, buildStoredState(state));
    }
  });

  return [state, dispatch];
}

const initialState = {
  // write is false until the user interacts with state to be saved
  // this should help prevent accidental writes of initial states
  write: false,

  // initialized is false until we have restored from localStorage
  // this should make it clearer that the app is initalizing
  // and prevent actions in intermediate state
  initialized: false,
  initializedState: false,
  initializedSearch: false,
  initializedLog: [{ log: `Catalog <b>${CURRENT_VERSION}</b>` }],
  loadPercent: 0,

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
      };
    }
    case '+init-log': {
      const loadPercent = Math.min(100, state.loadPercent + 20);

      return {
        ...state,
        initializedLog: [...state.initializedLog, { ...action }],
        loadPercent,
      };
    }
    case 'init': {
      const initialized = state.initializedSearch;
      const loadPercent = initialized ? 100 : Math.min(95, state.loadPercent + 20);

      return {
        ...state,
        initializedState: true,
        initialized,
        loadPercent,
      };
    }
    case 'init-search': {
      const initialized = state.initializedState;
      const loadPercent = initialized ? 100 : Math.min(95, state.loadPercent + 20);

      return {
        ...state,
        initializedSearch: true,
        initialized,
        loadPercent,
      };
    }

    case '+wishlist': {
      const nextState = { ...state, write: true };

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
      return { ...state, write: true, wishlist };
    }
    case '+catalog': {
      const nextState = { ...state, write: true };
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

      return { ...state, write: true, catalog };
    }
    case 'reset-wishlist': {
      return {
        ...state,
        write: true,
        wishlist: new Set(),
      };
    }
    case 'reset-catalog': {
      return {
        ...state,
        write: true,
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
