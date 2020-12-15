'use strict';
var EventEmitter = require("events").EventEmitter;
const messageType = require("./messageTypes");
const Protocol = require("./protocol");

const User = (idR, socketR) => {
  const protocol = Protocol();

  let id = idR;
  let socket = socketR;
  let userName = null;

  // User.prototype = new EventEmitter();
  // User.prototype.constructor = User;

  const sendInfo = (msg) => {
    socket.write(protocol.encode(3, msg));
  };

  const sendUsername = (msg) => {
    socket.write(protocol.encode(2, msg));
  };

  const sendMessage = (user, msg) => {
    const fullMessage = user.getUsername() + ": " + protocol.decode(msg).message;
    socket.write(protocol.encode(messageType.MESSAGE, fullMessage));
  };

  const sendRoom = (user, msg) => {
    const fullMessage = user.getUsername() + ": " + protocol.decode(msg).message;
    socket.write(protocol.encode(messageType.ROOM, fullMessage));
  };

  const setUsername = (name) => {
    const msgString = checkForEscape(name).toString();
    userName = msgString;
  };

  const getUsername = () => {
    return userName;
  }

  const getId = () => {
    return id;
  }

  const checkForEscape = (data) => {
    if (data[data.length - 1] == 10) {
      // 10 is UTF-8 escape char \n
      data.slice(0, -1);
      if (data[data.length - 1] == 13) {
        // 10 is windows \r
        data.slice(0, -1);
      }
      console.log(data);
      return data;
    }
    return data;
  }

  return {
    getId,
    getUsername,
    sendInfo,
    sendUsername,
    sendMessage,
    sendRoom,
    setUsername
  }
}

module.exports = User;
