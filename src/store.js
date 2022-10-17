const initialState = {
    symbols: [],
    user: null,
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_SYMBOL":
            return {
                ...state,
                symbols: [...symbols, action.payload],
            };
        default:
            return state;
    }
};

const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case "ADD_SYMBOL":
            return {
                ...state,
                symbols: [...symbols, "login"],
            };
        default:
            return state;
    }
};

const createStore = (reducer) => {
    let currentState = null;
    const currentReducer = reducer;
    let dispatching = false;

    const dispatch = (action) => {
        try {
            dispatching = true;
            currentState = reducer(currentState, action);
        } finally {
            dispatching = false;
        }
        subscribers.forEach((handler) => handler());
    };

    const getState = () => {
        return currentState;
    };

    const subscribe = (handler) => {
        subscribers.push(handler);

        return () => {
            const index = subscribers.indexOf(handler);
            subscribers.splice(index, 1);
        };
    };

    return {
        dispatch,
        getState,
        subscribe,
    };
};

const combineReducers = (reducers) => {
    return (state = {}, action) => {
        let nextState = {};
        Object.keys(reducers).map((reducerKey) => {
            const reducerFn = reducers[reducerKey];
            if (state?.reducerKey === undefined) {
                state;
            }
            nextState[reducerKey] = reducerFn(state[reducerKey], action);
        });
        return nextState;
    };
};

const store = createStore(
    combineReducers({
        root: rootReducer,
        login: loginReducer,
    }),
);

console.log(store.getState());
console.log(
    store.dispatch({
        type: "ADD_SYMBOL",
        payload: "ETHUSD",
    }),
);
console.log(store.getState());

module.exports = store;
