'use strict';
const net = require("net");
const Protocol = require("../networking/protocol");
const User = require("../networking/user");
const messageType = require('../networking/messageTypes');



net.bytesWritten = 300000;
net.bufferSize = 300000;

let peers = [];

const server = net.createServer((socket) => {
  // console.log("client connectedm - IP:" + socket.remoteAddress);
  let user;

  if (peers.length > 0) {
    user = User(peers[peers.length - 1].id + 1, socket);
    peers.push(user);
  }
  else {
    user = User(peers.length + 1, socket);
    peers.push(user);
  }

  socket.on("data", (data) => {
    let protocol = Protocol();
    // console.log("recieved data", data);
    const decoded = protocol.decode(data);
    // console.log("recieved", protocol)
    if (!user.userName && decoded.type == messageType.USERNAME) {
      user.setUsername(decoded.message);
      console.log("user", user)

      peers.map((peer) => {
        peer.sendInfo(user.getUsername() + "has joined the room!!");
      });
    } else {
      console.log("user", user.getUsername())
      peers.map((peer) => {
        peer.sendMessage(user, data);
      });
    }
    protocol = null;
  });

  socket.on("end", () => {
    peers.some((peer, i) => {
      if (peer.id == user.getId()) {
        peers.splice(i, 1);
      }
      return peer.id == user.getId();
    })

    user = null;

    socket.destroy();
    server.close();

    console.log("client disconnected");
  });

  socket.on('error', function (error) {
    console.log('Socket got problems: ', error.message);
  });
});

server.on("error", (err) => {
  console.log("error", err)
});

const port = process.env.PORT || 8124;

server.listen(port, () => {
  console.log("server started");
});
