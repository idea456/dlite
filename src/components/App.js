import React from "react";
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
  const [isPurchase, setPurchase] = React.useState(false);
  const [ProposalId, setProposalId] = React.useState("");
  const [ContractTypes, setContractTypes] = React.useState([]);
  const [ContractType, setContractType] = React.useState({});
  const [BuyPrice, setBuyPrice] = React.useState('')

  useEffect(() => {
    api.addEventListener("message", onMessage);
    api.addEventListener("open", onOpen);
  }, []);

  const Buy = () => {

    // console.log(
    //   ContractTypes[ContractType]?.min_contract_duration.replace(/\D/g, "")
    // );

    api.send(
      JSON.stringify({
        proposal: 1,
        amount: 5,
        barrier: ContractTypes[ContractType]?.barrier,
        basis: "payout",
        contract_type: ContractTypes[ContractType]?.contract_type,
        currency: "USD",
        duration: ContractTypes[
          ContractType
        ]?.min_contract_duration.replace(/\D/g, ""),
        duration_unit: ContractTypes[
          ContractType
        ]?.min_contract_duration.replace(/[^A-Za-z]/g, ""),
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
    
  };

  const onMessage = (msg) => {
    const data = JSON.parse(msg.data);
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
      case "contracts_for":
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          setContractTypes([]);
          return;
        }
        setContractTypes(data?.contracts_for?.available);
       
       
      case "proposal":
        if (data && data.error) {
          const { message = "Something went wrong, please reload" } =
            (data && data.error) || {};
          setError(message);
          
          return;
        }
        
        case "buy":
          setBuyPrice(data.buy?.buy_price);
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
  };

  // console.log(ContractTypes);

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

  const isDisabled = !(symbols && symbols.length);
  const symbolsToDisplay =
    symbols &&
    symbols.length &&
    (symbols.filter((sym) => sym.market === activeMarket) || []);

  const getContracts = () => {
    console.log("get");
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

  return (
    <div className="container">
      <div>
        <h2>DLite</h2>
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
        <select
          onChange={({ target: { value } }) => {
            setContractType(value);
            // console.log(ContractType?.min_contract_duration.replace(/[^A-Za-z]/g, ''), ContractType?.min_contract_duration.replace( /^\D+/g, ''))
          }}
          value={ContractType}
          disabled={isDisabled}
        >
          <option disabled value="">
            Contract Type
          </option>
          {ContractTypes.length > 0 &&
            ContractTypes.map((contract, key) => {
              return (
                <option value={key} key={key}>
                  {contract.contract_category_display}
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
        <button className="purchase_higher" type="button" onClick={() => {
          handleClick();
          Buy();
        }}>
          Purchase ↑
        </button>
        

        
      </div>
      {BuyPrice && (
          <div className="bg-white v-center rounded p-2 bordered">
            <h2 style={{
              color: '#000'
            }}>{`Contract Brought at ${BuyPrice}`}</h2>
          </div>
        )}
    </div>
  );
};

export default App;
