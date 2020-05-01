import React from 'react';

const LocalStorage = {
  Lookup: 'ACNHCatalogLookup--Lookup',
};

export default function useReducerState() {
  const [state, _dispatch] = React.useReducer(reducer, initialState);
  const dispatch = (type, data) => _dispatch({ type, ...data });

  // initialize lookup from local storage
  React.useEffect(() => {
    try {
      const initialLookup = new Set(JSON.parse(localStorage.getItem(LocalStorage.Lookup)));
      dispatch('init-lookup', { initialLookup });
    } catch (err) {
      console.error('Unable to initialize lookup');
    }
  }, []);

  // write every change to local storage
  React.useEffect(() => {
    localStorage.setItem(LocalStorage.Lookup, JSON.stringify([...state.lookup]));
  });

  return [state, dispatch];
}

const initialState = {
  input: '',
  search: '',
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
  console.debug('useReducerState', action.type, { ...action }, { ...state });

  switch (action.type) {
    case 'init-lookup': {
      return {
        ...state,
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

      return { ...state, items, lookup };
    }
    case '-lookup': {
      const lookup = new Set(state.lookup);
      lookup.delete(action.id);

      return { ...state, lookup };
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
    default:
      throw new Error(`invalid dispatch: ${JSON.stringify(action)}`);
  }
}
