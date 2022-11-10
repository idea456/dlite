import React from "react";
import { useRouter } from "../../App";

const NavBar = ({ setToken }) => {
    const persistedToken = React.useRef();
    const { navigate } = useRouter();

    React.useEffect(() => {
        persistedToken.current = localStorage.getItem("token");
    }, []);
    return (
        <div className='NavBarWrapper'>
            <img src='https://deriv.com/static/1b57a116945933314eefeec0030c8e9d/6fdc6/logo.webp' />
            <div>
                <button className='login' onClick={() => navigate("purchase")}>
                    Buy contract
                </button>
                <button className='login' onClick={() => navigate("history")}>
                    Statement
                </button>
                {persistedToken && (
                    <button
                        className='login'
                        onClick={() => {
                            localStorage.removeItem("token");
                            setToken("");
                        }}
                    >
                        <b>Logout</b>
                    </button>
                )}
            </div>
        </div>
    );
};

export default NavBar;
