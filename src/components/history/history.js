import React, { useEffect, useState } from "react";
import { attachHandlers } from "../../utils/handlers";
import { useRouter } from "../../App";
import Loading from "../loading/loading";
import(/* webpackPreload: true */ "./history.css");

const History = () => {
    const [historyData, setHistoryData] = useState([]);
    const [currency, setCurrency] = useState(0);
    const [loading, setLoading] = useState(true);

    const messageHandler = (message) => {
        switch (message.msg_type) {
            case "get_account_status":
                console.log("we got account status");
                if (message?.authorize)
                    setCurrency(message?.authorize?.currency);
                break;
            case "statement":
                console.log("we got statement");
                if (message?.statement)
                    setHistoryData(message?.statement?.transactions);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        attachHandlers(
            [
                {
                    get_account_status: 1,
                },
                {
                    statement: 1,
                    description: 1,
                    limit: 100,
                },
            ],
            ["get_account_status", "statement"],
            messageHandler,
            setLoading,
        );
    }, []);

    return (
        <div className='history'>
            {!loading ? (
                <div className='history__cards'>
                    {historyData.map((statement, key) => {
                        const purchase_time = new Date(
                            statement.purchase_time * 1000,
                        );
                        const transaction_time = new Date(
                            statement.transaction_time * 1000,
                        );
                        const shortcode = statement.shortcode.split("_");
                        return (
                            <div className='history__card' key={key}>
                                <div className='history__card-header'>
                                    <div>
                                        <h2>{`${shortcode[0]} | ${shortcode[1]}`}</h2>
                                    </div>
                                    <div
                                        className={
                                            statement.action_type === "buy"
                                                ? "buy"
                                                : "sell"
                                        }
                                    >
                                        <h3>{statement.action_type}</h3>
                                    </div>
                                </div>
                                <div className='history__card-body'>
                                    <div className='card-column'>
                                        <div>
                                            <h5>Purchase Time</h5>
                                            {statement?.purchase_time ? (
                                                <>
                                                    <h4>
                                                        {purchase_time.toLocaleTimeString()}
                                                    </h4>
                                                    <h4>
                                                        {purchase_time.toLocaleDateString()}
                                                    </h4>
                                                </>
                                            ) : (
                                                <>
                                                    <h4>N/A</h4>
                                                    <h4>N/A</h4>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <h5>Contract ID</h5>
                                            <h4>{statement.contract_id}</h4>
                                        </div>
                                    </div>
                                    <div className='card-column'>
                                        <div>
                                            <h5>Transaction Time</h5>
                                            <h4>
                                                {transaction_time.toLocaleTimeString()}
                                            </h4>
                                            <h4>
                                                {transaction_time.toLocaleDateString()}
                                            </h4>
                                        </div>
                                        <div>
                                            <h5>Currency</h5>
                                            <h4>{currency}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className='history__card-footer'>
                                    <div className='profit-loss'>
                                        <h2>Profit/Loss</h2>
                                        <h3
                                            style={
                                                statement.amount >= 0
                                                    ? "color: green"
                                                    : "color: red"
                                            }
                                        >
                                            {statement.amount >= 0
                                                ? `+` +
                                                  statement.amount.toFixed(2)
                                                : statement.amount.toFixed(2)}
                                        </h3>
                                    </div>
                                    <div className='balance'>
                                        <h2>Balance</h2>
                                        <h3>
                                            {statement.balance_after.toFixed(2)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default History;
