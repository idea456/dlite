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
      })
    );
    setToken(localToken);
    localStorage.setItem("token", localToken);
  };
  return (
    <div className="Sigin">
      <div className="SiginWrapper">
        <h1 className="title">DLite</h1>
        <input
          type="text"
          placeholder="Enter your api token..."
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button className="login" onClick={submitToken}>
          Login
        </button>
      </div>
    </div>
  );
};

export default SignIn;
