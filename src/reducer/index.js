import { useReducer } from "react";
import ReactDOM from "react-dom/client";

const initialState = [
  {
    symbols: [],
    activeSymbol: '',
    markets: {},
    activeMarket: '',
    tick: {},
    subscriptionId: '',
    color: 'black',
    error: '',
    isPurchase: false,
    ProposalId: '',
    show_login: false,
    show_sign_in: true,
    show_transection: false,
    historyData: [],
    currency: 0,
    api_key: ''
  }
];
const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return state.map(data => {
        if (data.name === action.payload) data.login = true;
        return data;
      });
    default:
      return state;
  }
};



