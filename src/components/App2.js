import React from "react";
import { useEffect, useState } from "react";
import History from "./History/history";
import api from "../api";
import "../styles/index.css";

const colors = {
  black: "#000000",
  red: "#FA3939",
  green: "#14CC00",
};

const App = () => {

  const [symbols, setSymbols] = useState([]);
  const [activeSymbol, setActiveSymbol] = useState("");
  const [markets, setMarkets] = useState({});
  const [activeMarket, setActiveMarket] = useState("");
  const [tick, setTick] = useState({});
  const [subscriptionId, setSubscriptionId] = useState("");
  const [color, setColor] = useState("black");
  const [error, setError] = useState("");
  const [isPurchase, setPurchase] = React.useState(false);
  const [ProposalId, setProposalId] = React.useState('');
  const [show_login, setShowLogin] = useState(false);
  const [show_sign_in, setShowSignIn] = useState(true);
  const [show_transection, setShowTransection] = useState(false);
  const [historyData, setHistoryData] = React.useState([]);
  const [currency, setCurrency] = React.useState(0);
  const [api_key, setApiKey] = React.useState('');
  const [userAuthorized, setUserAuthorized] = React.useState(false)

  useEffect(() => {
    api.addEventListener('open', onOpen)
    api.addEventListener('message', onMes);
  }, [userAuthorized]);


  const onOpen = () =>{
    api.send(
      JSON.stringify({
        active_symbols: "brief",
        product_type: "basic",
      })
    );
    api.send(
      JSON.stringify({
        authorize: api_key,
      })
    );
    setTimeout(() => {
      api.send(
        JSON.stringify({
          proposal_open_contract: 1,
          contract_id: 11111111,
          subscribe: 1,
        })
      );
    }, 2000);

    api.send(
      JSON.stringify({
        proposal: 1,
        amount: 100,
        barrier: "+0.1",
        basis: "payout",
        contract_type: "CALL",
        currency: "USD",
        duration: 60,
        duration_unit: "s",
        symbol: "R_100",
      })
    );
    api.send(
      JSON.stringify({
        authorize: api_key,
      })
    );

    // TODO: Find a better way to send api requests instead of setTimeout
    setTimeout(() => {
      api.send(
        JSON.stringify({
          get_account_status: 1,
        })
      );
    }, 500);
    setTimeout(() => {
      api.send(
        JSON.stringify({
          statement: 1,
          description: 1,
          limit: 100,
        })
      );
    }, 500);
  }

  const onMes = (message) => {
    var data = JSON.parse(message.data);

    if (data.authorize && data.authorize.loginid) {
      console.log('user authorized')
      setUserAuthorized(true);
      setShowLogin(!show_login);
      setShowSignIn(false);
    }
    if (data.error) {
      console.log(data.error.message);
    }

    console.log('onMessage')
    console.log(data?.statement)
    if (data?.statement) setHistoryData(data?.statement?.transactions);
    if (data?.authorize) setCurrency(data?.authorize?.currency);

    if (data.proposal?.id) {
      setProposalId(data.proposal?.id);
    }
    switch (data.msg_type) {
      case "active_symbols":
        setSymbols(data.active_symbols);
        const markets = {};
        data.active_symbols.forEach(({ market, market_display_name }) => {
          // creating a hashmap to store market and market_display_name
          markets[market] = `${market}:${market_display_name}`;
        });
        setMarkets(markets);
        break;

      case "tick":
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          setTick({});
          return;
        }
        setTick((prevTick) => {
          const { tick } = data;
          if (prevTick?.quote > tick?.quote) {
            setColor(colors["red"]);
          } else if (prevTick?.quote < tick?.quote) {
            setColor(colors["green"]);
          } else {
            setColor(colors["black"]);
          }
          return tick;
        });
        setSubscriptionId(data.subscription.id);
        break;

      default:
        return;
    }
  };

  const NavBar = () => {
    return (
      <div className="NavBarWrapper">
        <img src="https://deriv.com/static/1b57a116945933314eefeec0030c8e9d/6fdc6/logo.webp" />
        <div>
          {show_login ? <button
            className="login"
            onClick={() => {
              setShowSignIn(true);
              setShowSignIn(!show_sign_in);
              setShowLogin(!show_login);
              setShowTransection(false)
            }}
          ><b>LOGOUT</b></button> : <button
            className="login"
            onClick={() => {
              setShowSignIn(true);
              setShowTransection(false);
              setShowLogin(false);
            }}
          ><b>SIGN IN</b></button>}
          {show_login &&
            <button className="login" onClick={() => setShowTransection(!show_transection)}>SHOW TRANSECTION</button>
          }
        </div>
      </div>
    )
  }

  const SignIn = () => {
    const handleInputChange = (key) => {
      setApiKey(key)
      localStorage.setItem('api_key', JSON.stringify([{ key }]));
    }

    const checkAuth = () => {
      api.send(
        JSON.stringify({
          authorize: api_key,
          req_id: 1
        })
      );

    };
    return (
      <div className="Sigin">
        <div
          className="SiginWrapper">
          <input type="text"
            placeholder="ENTER YOUR API TOKEN"
            onChange={(e) => handleInputChange(e.target.value)}
          />
          <button className="login" onClick={() => {
            checkAuth();
          }}>
            LOGIN
          </button>
        </div>
      </div>
    )
  }
  const MarketContainer = () => {
    const Buy = () => {
      api.send(
        JSON.stringify({
          buy: ProposalId,
          price: 100,
        })
      );
    }


    useEffect(() => {
      if (activeSymbol) {
        api.send(
          JSON.stringify({
            ticks: activeSymbol,
            subscribe: 1,
          })
        );

        if (subscriptionId) {
          console.info("forget: ", subscriptionId);
          api.send(
            JSON.stringify({
              forget: subscriptionId,
            })
          );
        }
      }
    }, [activeSymbol]);

    useEffect(() => {
      setError("");
    }, [activeMarket, activeSymbol]);

    const isDisabled = !(symbols && symbols.length);
    const symbolsToDisplay =
      symbols &&
      symbols.length &&
      (symbols.filter((sym) => sym.market === activeMarket) || []);

    const handleClick = () => {
      setPurchase(!isPurchase);
    };
    return (
      <div className="container">
        <div>
          <h2>Price Tracker</h2>
        </div>
        <div>
          <select
            onChange={({ target: { value } }) => setActiveMarket(value)}
            value={activeMarket}
            disabled={isDisabled}
          >
            <option disabled value="">
              Select Market
            </option>
            {Object.values(markets).map((mar) => {
              const [market, name] = mar.split(":");
              return (
                <option key={mar} value={market}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <select
            onChange={({ target: { value } }) => setActiveSymbol(value)}
            value={activeSymbol}
            disabled={isDisabled}
          >
            <option disabled value="">
              Select Symbol
            </option>
            {symbolsToDisplay &&
              symbolsToDisplay.length &&
              symbolsToDisplay.map((sym) => {
                return (
                  <option value={sym.symbol} key={sym.symbol}>
                    {sym.display_name}
                  </option>
                );
              })}
          </select>
        </div>
        <div></div>
        <div className="bg-white v-center rounded p-2 bordered">
          <h2 style={{ color }}>{tick && Number(tick.quote || 0)}</h2>
        </div>
        {!activeSymbol && !error && (
          <span className="txt-special-grey">
            Please select a market and symbol to track the price
          </span>
        )}
        {activeSymbol && !error && (
          <span className="txt-market-running">Market is running</span>
        )}
        {error && <span className="txt-error">{error}</span>}

        <div className="purchase_button">
          <button className="purchase_higher" type="button" onClick={handleClick}>
            Purchase ↑
          </button>
          <button className="purchase_lower" type="button" onClick={handleClick}>
            Purchase ↓
          </button>
        </div>

        {isPurchase && (
          <div className="bg-white v-center rounded p-2 bordered">
            <h2 style={{ color }}>{tick && Number(tick.quote || 0)}</h2>
          </div>
        )}
      </div>
    )
  }


  return (
    <React.Fragment>
      <NavBar />
      {!show_transection && show_sign_in && <SignIn />}
      {!show_sign_in && !show_transection && <MarketContainer />}
      {api_key && show_transection && <History historyData={historyData} currency={currency} />}
    </React.Fragment>
  );
};

export default App;
