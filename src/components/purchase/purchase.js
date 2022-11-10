import React from "react";
import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/index.css";
import "./purchase.css";

const colors = {
  black: "#ffffff",
  red: "#FA3939",
  green: "#14CC00",
};

const Purchase = () => {
  const [symbols, setSymbols] = useState([]);
  const [activeSymbol, setActiveSymbol] = useState("");
  const [markets, setMarkets] = useState({});
  const [activeMarket, setActiveMarket] = useState("");
  const [tick, setTick] = useState({});
  const [subscriptionId, setSubscriptionId] = useState("");
  const [color, setColor] = useState("black");
  const [error, setError] = useState("");
  const [isPurchase, setPurchase] = React.useState(false);
  const [ProposalId, setProposalId] = React.useState("");
  const [ContractTypes, setContractTypes] = React.useState([]);
  const [contractId, setContractId] = React.useState("");
  const [tradeTypes, setTradeTypes] = useState([]);
  const [tradeType, setTradeType] = useState("");
  const [callPut, setCallPut] = useState([]);
  const [BuyPrice, setBuyPrice] = React.useState("");

  useEffect(() => {
    api.addEventListener("message", onMessage);
    api.addEventListener("open", onOpen);
  }, []);

  useEffect(() => {
    if (activeSymbol) {
      api.send(
        JSON.stringify({
          ticks: activeSymbol,
          subscribe: 1,
        })
      );

      getContracts();

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

  const onMessage = (msg) => {
    const data = JSON.parse(msg.data);

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
      case "contracts_for":
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          setContractTypes([]);
          return;
        }
        console.log(data);
        setContractTypes(data?.contracts_for?.available);
        setTradeTypes(
          data?.contracts_for?.available.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.contract_category_display ===
                  value.contract_category_display
              )
          )
        );
        break;
      case "proposal":
        console.log(data.proposal?.id);
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          return;
        }
        if (data?.proposal?.id) {
          setProposalId(data.proposal?.id);
        }
        break;
      case "buy":
        console.log(data);
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          return;
        } else {
          setBuyPrice(data.buy?.buy_price);
        }
        break;
      case "sell":
        console.log(data);
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          return;
        } else {
          setBuyPrice(data.buy?.buy_price);
        }
        break;
      case "portfolio":
        console.log(data?.portfolio?.contracts[0]?.contract_id);
        setContractId(data?.portfolio?.contracts[0]?.contract_id);
        break;
      case "authorize":
        console.log(data);
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
  };

  const BuySell = (button_type) => {
    if (button_type === "buy") {
      const duration = ContractTypes[0]?.min_contract_duration.replace(
        /\D/g,
        ""
      );
      const duration_unit = ContractTypes[0]?.min_contract_duration.replace(
        /[^A-Za-z]/g,
        ""
      );

      console.log(duration, duration_unit);
      api.send(
        JSON.stringify({
          proposal: 1,
          amount: 5,
          barrier: ContractTypes[0]?.barrier,
          basis: "payout",
          contract_type: ContractTypes[0]?.contract_type,
          currency: "USD",
          duration: duration === "0" ? 5 : duration,
          duration_unit: duration_unit === "" ? "t" : duration_unit,
          symbol: activeSymbol,
        })
      );

      setTimeout(() => {
        api.send(
          JSON.stringify({
            buy: ProposalId,
            price: 5,
          })
        );
      }, 5000);
    } else {
      api.send(
        JSON.stringify({
          proposal: 1,
          amount: 5,
          barrier: ContractTypes[1]?.barrier,
          basis: "payout",
          contract_type: ContractTypes[1]?.contract_type,
          currency: "USD",
          duration: ContractTypes[1]?.min_contract_duration.replace(/\D/g, ""),
          duration_unit: ContractTypes[1]?.min_contract_duration.replace(
            /[^A-Za-z]/g,
            ""
          ),
          symbol: activeSymbol,
        })
      );

      setTimeout(
        api.send(
          JSON.stringify({
            portfolio: 1,
          })
        ),
        1000
      );

      setTimeout(() => {
        api.send(
          JSON.stringify({
            sell: contractId,
            price: 5,
          })
        );
      }, 5000);
    }
  };

  const getContracts = () => {
    api.send(
      JSON.stringify({
        contracts_for: activeSymbol,
        currency: "USD",
        product_type: "basic",
      })
    );
  };

  const handleClick = () => {
    setPurchase(!isPurchase);
  };

  const isDisabled = !(symbols && symbols.length);

  const symbolsToDisplay =
    symbols &&
    symbols.length &&
    (symbols.filter((sym) => sym.market === activeMarket) || []);

  console.log(callPut);
  return (
    <div className="container">
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
          onChange={({ target: { value } }) => {
            setActiveSymbol(value);
          }}
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
        <select
          onChange={({ target: { value } }) => {
            setTradeType(value);
            let filtered = ContractTypes.filter(
              (trade_type) => value === trade_type?.contract_category_display
            );
            setCallPut(filtered.slice(-2));
          }}
          value={tradeType}
          disabled={isDisabled}
        >
          <option disabled value="">
            Trade Types
          </option>
          {tradeTypes.length > 0 &&
            tradeTypes.map((trade, key) => {
              return (
                <option value={trade.contract_category_display} key={key}>
                  {trade.contract_category_display}
                </option>
              );
            })}
        </select>
      </div>
      <div></div>
      <div className="bg-white v-center rounded p-2 bordered">
        <h2 style={{ color: "white" }}>{tick && Number(tick.quote || 0)}</h2>
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
      <div className="button-group">
        <button
          className="button-buy"
          type="button"
          onClick={() => {
            handleClick();
            BuySell("buy");
          }}
        >
          Up
        </button>
        <button
          className="button-sell"
          type="button"
          onClick={() => {
            handleClick();
            BuySell("sell");
          }}
        >
          Down
        </button>
      </div>
      {BuyPrice && (
        <div className="bg-white v-center rounded p-2 bordered">
          <h2
            style={{
              color: "#fff",
            }}
          >{`Contract Brought at ${BuyPrice}`}</h2>
        </div>
      )}
    </div>
  );
};

export default Purchase;
