const net = require("net");
const Protocol = require("../networking/protocol");
const User = require("../networking/user");
const messageType = require('../networking/messageTypes');

net.bytesWritten = 300000;
net.bufferSize = 300000;

let peers = [];

const server = net.createServer((socket) => {
  console.log("client connectedm - IP:" + socket.remoteAddress);

  let user;

  if (peers.length > 0) {
    user = new User(peers[peers.length - 1].id + 1, socket);
    peers.push(user);
  }
  else {
    user = new User(peers.length + 1, socket);
    peers.push(user);
  }

  socket.on("data", (data) => {
    let protocol = new Protocol();
    console.log("recieved data", data);
    protocol.decode(data);
    console.log("recieved", protocol)
    if (!user.userName && protocol.type == messageType.USERNAME) {
      user.setUsername(protocol.message);

      peers.map((peer) => {
        peer.sendInfo(user.userName + "has joined the room!!");
      });
    } else {
      peers.map((peer) => {
        peer.sendMessage(user, data);
      });
    }
  });

  socket.on("end", () => {
    peers.some((peer, i) => {
      if (peer.id == user.id) {
        peers.splice(i, 1);
      }
      return peer.id == user.id;
    })

    console.log("client disconnected");
  });
});

server.on("error", (err) => {
  console.log("error", err)
  throw err;
});

server.listen(8124, () => {
  console.log("server started");
});
