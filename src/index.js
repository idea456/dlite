import store from "./store";
import "../styles/index.css";

// const socket = new WebSocket("wss://echo.websocket.org");

// socket.addEventListener("open", (e) => {
//     socket.send("Hewwo");
// });

// socket.addEventListener("message", (e) => {
//     console.log("Message from socket: %s", e.data);
// });

console.log(store.getState());
