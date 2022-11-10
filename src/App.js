import React from "react";
// import Purchase from "./components/purchase/purchase";
// import History from "./components/history/history.jsx";
import Loadable from "react-loadable";
import Loading from "./components/loading/loading";
import api from "./api";
// import(/* webpackPrefetch: true */ "./api");
import "./styles/index.css";

const LazyPurchase = Loadable({
    loader: () => import("./components/purchase/purchase"),
    loading: Loading,
});
const LazyHistory = Loadable({
    loader: () =>
        import(/* webpackPreload: true */ "./components/history/history"),
    loading: () => {},
});

const RouterContext = React.createContext();

export const useRouter = () => {
    return React.useContext(RouterContext);
};

const App = () => {
    const [page, setPage] = React.useState("purchase");

    const navigate = (view) => {
        console.log("going to ", view);
        setPage(view);
    };

    React.useEffect(() => {
        api.addEventListener("open", authorize);
    }, []);

    const authorize = async () => {
        api.send(
            JSON.stringify({
                authorize: "iM0TwAmsmTAheVh",
            }),
        );
    };

    return (
        <RouterContext.Provider value={{ navigate }}>
            {page === "history" && <LazyHistory />}
            {page === "purchase" && <LazyPurchase />}
        </RouterContext.Provider>
    );
};

export default App;
