'use strict';
var crypto = require('crypto');

const Protocol = () => {
    const algorithm = 'aes-256-gcm';
    const key = 'd6F3Efeqd6F3Efeqd6F3Efeqd6F3Efeq';
    const password = new Buffer.from(key, 'utf8');

    let type = undefined;
    let lenght = undefined;
    let message = undefined;
    let rawData = undefined;
    let rawDataString = undefined;
    let encrypted = undefined;

    const encode = (type, message) => {
        let cipher,
            iv;

        iv = crypto.randomBytes(32);
        // console.log("IV encode", exportHex(iv));
        cipher = crypto.createCipheriv(algorithm, password, iv);

        let dataBuf = new Buffer.from(message, "utf8");

        if (dataBuf.indexOf('\n') > 1) {
            dataBuf = dataBuf.slice(0, -1);
            if (dataBuf.indexOf('\r') > 1) {
                dataBuf = dataBuf.slice(0, -1);
            }
        } else {
            dataBuf = dataBuf;
        }

        let infoBuf = new Buffer.alloc(4);
        let lenghtBuf = new Buffer.alloc(4);

        infoBuf.writeUInt32BE(type, 0);
        lenghtBuf.writeUInt32BE(dataBuf.length, 0);

        rawData = Buffer.concat([infoBuf, lenghtBuf, dataBuf]);

        const cipherUpdate = cipher.update(rawData);
        const cipherFinal = cipher.final();
        const cipherTag = cipher.getAuthTag();

        // console.log("tag", exportHex(cipherTag));

        encrypted = Buffer.concat([cipherTag, iv, cipherUpdate, cipherFinal]);
        // console.log("encrypted", exportHex(this.encrypted))

        return encrypted;
    };

    const decode = (oldBuf) => {
        var decipher,
            iv;

        // console.log("oldbuf", exportHex(oldBuf));

        const cipherTag = oldBuf.slice(0, 16);
        oldBuf = oldBuf.slice(16);

        // console.log("cyphertag decode", exportHex(oldBuf))

        iv = oldBuf.slice(0, 32);
        oldBuf = oldBuf.slice(32);
        // console.log("IV decode", exportHex(iv));
        decipher = crypto.createDecipheriv(algorithm, password, iv);

        decipher.setAuthTag(cipherTag);
        let decrypted = Buffer.concat([decipher.update(oldBuf), decipher.final()]);

        // console.log("decrypted", exportHex(decrypted))

        // console.log(exportHex(decrypted));

        lenght = decrypted.readUInt32BE(4);
        let index = 8 + lenght;

        // console.log("lenght", lenght)

        type = decrypted.readUInt32BE(0); // hexa to decimal
        // console.log("type", type)
        message = decrypted.toString("utf8", 8, index); // hexa to string
        // console.log("message", message)
        rawData = decrypted;
        rawDataString = decrypted.toString();

        return { type, message };
    };

    const exportHex = (buf) => {
        return "\n" + buf.toString('hex').match(/../g).join(' ').replace(/.{24}/g, '$&\n');
    }

    return {
        message,
        type,
        decode,
        encode
    }
}

module.exports = Protocol;
