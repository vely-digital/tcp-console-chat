'use strict';
// PROTOCOL
// 0 -> messageType
// 1 -> lenght of message

const messageType = {
    MESSAGE: 1, // message
    USERNAME: 2, // username
    INFO: 3, // info
    ROOM: 4, // room join
}

module.exports = messageType;
