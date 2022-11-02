import { useEffect, useState } from "react";
import api from "../api";
import "../styles/index.css";
import "../styles/purchase.css";

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
  const [isPurchase, setPurchase] = useState(false);
  const [ProposalId, setProposalId] = useState("");

  useEffect(() => {
    api.addEventListener("message", onMessage);
    api.addEventListener("open", onOpen);
  }, []);

  useEffect(() => {
    if (ProposalId !== "") {
      Buy();
    }
  }, [ProposalId]);

  const Buy = () => {
    api.send(
      JSON.stringify({
        buy: ProposalId,
        price: 100,
      })
    );
  };

  const onMessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.proposal?.id) {
      setProposalId(data.proposal?.id);
    }
    const marketsData = {};
    switch (data.msg_type) {
      case "active_symbols":
        setSymbols(data.active_symbols);

        data.active_symbols.forEach(({ market, marketDisplayName }) => {
          // creating a hashmap to store market and market_display_name
          markets[market] = `${market}:${marketDisplayName}`;
        });
        setMarkets(marketsData);
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
            setColor(colors.red);
          } else if (prevTick?.quote < tick?.quote) {
            setColor(colors.green);
          } else {
            setColor(colors.black);
          }
          return tick;
        });
        setSubscriptionId(data.subscription.id);
        break;

      default:
        return;
    }
  };

  const onOpen = () => {
    api.send(
      JSON.stringify({
        active_symbols: "brief",
        product_type: "basic",
      })
    );
    api.send(
      JSON.stringify({
        authorize: "qfohvs33BsJx9is",
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
  };

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
            symbolsToDisplay.map((sym) => (
              <option value={sym.symbol} key={sym.symbol}>
                {sym.display_name}
              </option>
            ))}
        </select>
      </div>
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

        {isPurchase && (
          <div className="bg-white v-center rounded p-2 bordered">
            <h2 style={{ color }}>{tick && Number(tick.quote || 0)}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
