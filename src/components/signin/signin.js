import React from "react";
import api from "../../api";

const SignIn = ({ setToken }) => {
    const [localToken, setLocalToken] = React.useState("");
    const handleInputChange = (key) => {
        // setToken(key);
        // localStorage.setItem("token", key);
        setLocalToken(key);
    };

    const submitToken = () => {
        api.send(
            JSON.stringify({
                authorize: localToken,
                req_id: 1,
            }),
        );
        console.log("I AM CAOLLLLED", localToken);
        setToken(localToken);
        localStorage.setItem("token", localToken);
    };
    return (
        <div className='Sigin'>
            <div className='SiginWrapper'>
                <input
                    type='text'
                    placeholder='ENTER YOUR API TOKEN'
                    onChange={(e) => handleInputChange(e.target.value)}
                />
                <button className='login' onClick={submitToken}>
                    LOGIN
                </button>
            </div>
        </div>
    );
};

export default SignIn;
