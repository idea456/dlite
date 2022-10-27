import { useEffect, useState } from "react";
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

    useEffect(() => {
        api.addEventListener("message", onMessage);
        api.addEventListener("open", onOpen);
    }, []);

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
    };

    useEffect(() => {
        if (activeSymbol) {
            api.send(
                JSON.stringify({
                    ticks: activeSymbol,
                    subscribe: 1,
                }),
            );

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

    const isDisabled = !(symbols && symbols.length);
    const symbolsToDisplay =
        symbols &&
        symbols.length &&
        (symbols.filter((sym) => sym.market === activeMarket) || []);
    return (
        <div className='container'>
            <div>
                <h2>Price Tracker</h2>
            </div>
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
                    onChange={({ target: { value } }) => setActiveSymbol(value)}
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
        </div>
    );
};

export default App;
