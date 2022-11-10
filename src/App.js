import React from "react";
// import Purchase from "./components/purchase/purchase";
// import History from "./components/history/history.jsx";
import Loadable from "react-loadable";
import Loading from "./components/loading/loading";
import NavBar from "./components/navbar";
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
    loading: Loading,
});

const LazySignIn = Loadable({
    loader: () => import("./components/signin"),
    loading: Loading,
});

const RouterContext = React.createContext();

export const useRouter = () => {
    return React.useContext(RouterContext);
};

const App = () => {
    const [page, setPage] = React.useState("purchase");
    const [token, setToken] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const navigate = (view) => {
        setPage(view);
    };

    React.useEffect(() => {
        const persistedToken = localStorage.getItem("token");
        setToken(persistedToken);
        if (persistedToken) {
            api.addEventListener("open", authorize);
            api.addEventListener("message", onAuthorized);
        }
    }, [token]);

    const onAuthorized = (message) => {
        const res = JSON.parse(message.data);
        if (res.msg_type === "authorize") {
            console.log("AUTHORIZED!");
            setLoading(false);
        }
    };

    const authorize = async () => {
        api.send(
            JSON.stringify({
                authorize: token,
            }),
        );
    };

    if (!token) {
        console.log("is token here", token);
        return <LazySignIn setToken={setToken} />;
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <RouterContext.Provider value={{ navigate }} className='app'>
            <NavBar setToken={setToken} />
            {page === "history" && <LazyHistory />}
            {page === "purchase" && <LazyPurchase />}
        </RouterContext.Provider>
    );
};

export default App;
