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
    const [color, setColor] = useState("white");
    const [error, setError] = useState("");
    const [isPurchase, setPurchase] = useState(false);
    const [ProposalId, setProposalId] = useState("");
    const [ContractTypes, setContractTypes] = useState([]);
    const [tradeTypes, setTradeTypes] = useState([]);
    const [tradeType, setTradeType] = useState("");
    const [callPut, setCallPut] = useState([]);
    const [BuyPrice, setBuyPrice] = useState("");
    const [balance, setBalance] = useState(0);
    const [isProcessing, setIsProcesing] = useState(false);

    useEffect(() => {
        if (api.readyState === WebSocket.OPEN) {
            onOpen();
        } else {
            api.addEventListener("open", onOpen);
        }
        api.addEventListener("message", onMessage);
    }, []);

    useEffect(() => {
        if (activeSymbol) {
            api.send(
                JSON.stringify({
                    ticks: activeSymbol,
                    subscribe: 1,
                }),
            );

            getContracts();

            if (subscriptionId) {
                console.info("forget: ", subscriptionId);
                api.send(
                    JSON.stringify({
                        forget: subscriptionId,
                    }),
                );
            }
        }
    }, [activeSymbol]);

    useEffect(() => {
        setError("");
    }, [activeMarket, activeSymbol]);

    useEffect(() => {
        if (ProposalId !== "") {
            api.send(
                JSON.stringify({
                    buy: ProposalId,
                    price: 5,
                }),
            );
        }
    }, [ProposalId]);

    const onMessage = (msg) => {
        const data = JSON.parse(msg.data);

        switch (data.msg_type) {
            case "active_symbols":
                setSymbols(data.active_symbols);
                const markets = {};
                data.active_symbols.forEach(
                    ({ market, market_display_name }) => {
                        // creating a hashmap to store market and market_display_name
                        markets[market] = `${market}:${market_display_name}`;
                    },
                );
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
                                    value.contract_category_display,
                            ),
                    ),
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
                setProposalId(data?.proposal?.id);
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
                    api.send(
                        JSON.stringify({
                            statement: 1,
                            description: 1,
                            limit: 1,
                        }),
                    );
                    setIsProcesing(false);
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
                    setBuyPrice(data.sell?.buy_price);
                }
                break;
            case "statement":
                setBalance(data?.statement?.transactions[0]?.balance_after);
                console.log(data?.statement?.transactions[0]?.balance_after);
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
            }),
        );

        api.send(
            JSON.stringify({
                statement: 1,
                description: 1,
                limit: 1,
            }),
        );
    };

    const BuySell = (button_type) => {
        setIsProcesing(true);
        const contract_type = button_type === "buy" ? callPut[0] : callPut[1];

        const duration = contract_type?.min_contract_duration.replace(
            /\D/g,
            "",
        );
        const duration_unit = contract_type?.min_contract_duration.replace(
            /[^A-Za-z]/g,
            "",
        );

        if (tradeType === "Multiply Up/Multiply Down") {
            const multiplier = contract_type?.multiplier_range[0];
            api.send(
                JSON.stringify({
                    proposal: 1,
                    amount: 5,
                    basis: "stake",
                    contract_type: contract_type?.contract_type,
                    currency: "USD",
                    symbol: activeSymbol,
                    multiplier,
                }),
            );
        } else {
            api.send(
                JSON.stringify({
                    proposal: 1,
                    amount: 5,
                    barrier: contract_type?.barrier,
                    basis: "stake",
                    contract_type: contract_type?.contract_type,
                    currency: "USD",
                    duration: duration === "0" ? 5 : duration,
                    duration_unit: duration_unit === "" ? "t" : duration_unit,
                    symbol: activeSymbol,
                }),
            );
        }
    };

    const getContracts = () => {
        api.send(
            JSON.stringify({
                contracts_for: activeSymbol,
                currency: "USD",
                product_type: "basic",
            }),
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
        <div className='container'>
            <h2 className='user-balance'>$ {balance}</h2>
            <h2 className='title'>🌈 DLite</h2>
            <div>
                <select
                    onChange={({ target: { value } }) => setActiveMarket(value)}
                    value={activeMarket}
                    disabled={isDisabled}
                >
                    <option disabled value=''>
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
                    <option disabled value=''>
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
                            (trade_type) =>
                                value === trade_type?.contract_category_display,
                        );
                        setCallPut(filtered.slice(-2));
                    }}
                    value={tradeType}
                    disabled={isDisabled}
                >
                    <option disabled value=''>
                        Trade Types
                    </option>
                    {tradeTypes.length > 0 &&
                        tradeTypes.map((trade, key) => {
                            return (
                                <option
                                    value={trade.contract_category_display}
                                    key={key}
                                >
                                    {trade.contract_category_display}
                                </option>
                            );
                        })}
                </select>
            </div>
            <div></div>
            <div className='bg-white v-center rounded p-2 bordered'>
                <h2 style={{ color }}>{tick && Number(tick.quote || 0)}</h2>
            </div>
            {!activeSymbol && !error && (
                <span className='txt-special-grey'>
                    Please select a market and symbol to track the price
                </span>
            )}
            {activeSymbol && !error && (
                <span className='txt-market-running'>Market is running</span>
            )}
            {error && <span className='txt-error'>{error}</span>}
            <div className='button-group'>
                <button
                    className='button-buy'
                    type='button'
                    onClick={() => {
                        handleClick();
                        BuySell("buy");
                    }}
                >
                    Up
                </button>
                <button
                    className='button-sell'
                    type='button'
                    onClick={() => {
                        handleClick();
                        BuySell("sell");
                    }}
                >
                    Down
                </button>
            </div>
            {!isProcessing && BuyPrice && (
                <div className='bg-white v-center rounded p-2 bordered'>
                    <h2
                        style={{
                            margin: "0 auto",
                            color: "#fff",
                        }}
                    >{`Contract Brought at $${BuyPrice}`}</h2>
                </div>
            )}
            {isProcessing && (
                <div className='bg-white v-center rounded p-2 bordered'>
                    <h2 style={{ margin: "0 auto" }} className='processing'>
                        Buying contract...
                    </h2>
                </div>
            )}
        </div>
    );
};

export default Purchase;
