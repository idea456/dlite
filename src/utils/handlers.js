import api from "../api/";

export const attachHandlers = (
  messages,
  priority,
  messageHandler,
  loadingHandler
) => {
  let queue = [...priority];
  let count = queue.length;
  let buffer = [];

  const onOpen = () => {
    for (const message of messages) {
      api.send(JSON.stringify(message));
    }
    loadingHandler(true);
  };
  const onMessage = (message) => {
    const res = JSON.parse(message.data);
    if (priority.includes(res.msg_type)) {
      count -= count <= 0 ? 0 : 1;
    }

    if (res.msg_type === queue[0]) {
      messageHandler(res);
      queue.shift();
    } else {
      buffer.push(res);
    }

    if (count <= 0) {
      while (queue.length > 0) {
        let msg_type = queue.shift();
        let item = buffer.find((msg) => msg.msg_type === msg_type);
        messageHandler(buffer.find((msg) => msg.msg_type === msg_type));
      }
      loadingHandler(false);
    }
  };

  if (api.readyState === WebSocket.OPEN) {
    onOpen();
  } else {
    api.addEventListener("open", onOpen);
  }

  api.addEventListener("message", onMessage);
};
