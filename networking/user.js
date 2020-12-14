var EventEmitter = require("events").EventEmitter;
const messageType = require("./messageTypes");
const Protocol = require("./protocol");

const protocol = new Protocol();

var User = function User(id, socket) {
  this.id = id;
  this.socket = socket;
  this.userName = null;
};

User.prototype = new EventEmitter();
User.prototype.constructor = User;

User.prototype.sendInfo = function (msg) {
  this.socket.write(protocol.encode(3, msg));
};

User.prototype.sendUsername = function (msg) {
  this.socket.write(protocol.encode(2, msg));
};

User.prototype.sendMessage = function (user, msg) {
  const fullMessage = user.userName + ": " + protocol.decode(msg).message;
  this.socket.write(protocol.encode(messageType.MESSAGE, fullMessage));
};

User.prototype.sendRoom = function (user, msg) {
  const fullMessage = user.userName + ": " + protocol.decode(msg).message;
  this.socket.write(protocol.encode(messageType.ROOM, fullMessage));
};

User.prototype.setUsername = function (name) {
  const msgString = checkForEscape(name).toString();
  this.userName = msgString;
};

function checkForEscape(data) {
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

module.exports = User;
