import React from "react";
import Purchase from "./components/purchase/purchase";
import History from "./components/history/history";
import api from "./api";
import "./styles/index.css";

const App = () => {
  React.useEffect(() => {
    api.addEventListener("open", authorize);
  }, []);

  const authorize = async () => {
    api.send(
      JSON.stringify({
        authorize: "iM0TwAmsmTAheVh",
      })
    );
  };

  return (
    <>
      <History />
      <Purchase />
    </>
  );
};

export default App;
