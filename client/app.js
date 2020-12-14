const net = require('net');
const client = new net.Socket();
const util = require("util");
const readline = require("readline");
const { PromiseSocket } = require("promise-socket")

const Protocol = require('../networking/protocol')
const messageType = require('../networking/messageTypes');

const blessed = require('neo-blessed');
const chalk = require('chalk');
const ora = require('ora');

function makeScreen() {
    return blessed.screen({
        smartCSR: true,
        title: 'Chat terminal',
    });
}

function makeMessageList() {
    return blessed.list({
        align: 'left',
        mouse: true,
        keys: true,
        width: '100%',
        height: '97%',
        top: 0,
        left: 0,
        scrollbar: {
            ch: ' ',
            inverse: true,
        },
        items: [],
    });
}

function makeTextArea() {
    return blessed.textarea({
        bottom: 0,
        height: '3%',
        inputOnFocus: true,
        padding: {
            top: 1,
            left: 1,
        },
        style: {
            fg: '#787878',
            bg: '#454545',

            focus: {
                fg: '#f6f6f6',
                bg: '#353535',
            },
        },
    });
}

function errorMessage(message) {
    return chalk.red(message);
}

function asyncQuestion(question, rl) {
    return new Promise((resolve, reject) => {
        rl.question(question, (answer) => {
            resolve(answer)
        })
    })
}

function asyncQuestionProcess(question) {
    return new Promise(async (res, rej) => {
        try {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            let data = undefined;

            while (data == undefined) {
                let answer = await asyncQuestion(question, rl);
                if (answer != '') {
                    data = answer;
                    rl.close();
                }
            }

            res(data);

            rl.on("close", function () {
                res(data);
            });

        } catch (err) {
            rej(err)
        }
    })
}

async function main() {
    try {
        let protoc = new Protocol();
        let promiseSocket = new PromiseSocket(client);;
        const ipPort = await asyncQuestionProcess("Please enter ip:port ");
        const answer = await asyncQuestionProcess("Please enter your name: ");
        const spinner = ora('Loading server').start();
        await promiseSocket.connect(8124, "localhost");
        await promiseSocket.write(protoc.encode(messageType.USERNAME, answer));
        spinner.succeed();

        process.stdin.removeAllListeners('data');

        const screen = makeScreen();
        let messageList = makeMessageList();
        var input = makeTextArea();

        function addMessage(message) {
            messageList.addItem(message);
            messageList.scrollTo(100);
        }

        let lastRecievedType = null;

        input.key('enter', async function () {
            var message = this.getValue();
            try {
                let protocol = new Protocol();
                let type = (lastRecievedType == messageType.USERNAME) ? messageType.USERNAME : messageType.MESSAGE;
                if (message == "\n") {
                    addMessage(errorMessage("Input can't be empty"));
                }
                else {
                    await promiseSocket.write(protocol.encode(type, message));
                }
            } catch (err) {
                // error handling
            } finally {
                this.clearValue();
                screen.render();
            }
        })

        screen.render();

        client.on('data', async (data) => {
            let protocol = new Protocol();
            protocol.decode(data);
            lastRecievedType = protocol.type;
            let message = "";

            if (process.env.NODE_ENV == "DEV") {
                switch (protocol.type) {
                    case messageType.INFO:
                        message = "INFO: ";
                        break;
                    case messageType.USERNAME:
                        message = "USERNAME: ";
                        break;
                    case messageType.MESSAGE:
                        message = "MESSAGE: ";
                        break;
                    default:
                        message = "UNKNOWN: ";
                        break;
                }
            }

            // console.log("message", protocol);
            message += protocol.message

            messageList.addItem(message);
            messageList.scrollTo(100);
            screen.render();
        });

        // Append our box to the screen.
        screen.key(['escape', 'q', 'C-c'], function () {
            return process.exit(0);
        });

        screen.append(messageList);
        screen.append(input);
        input.focus();

        screen.render();
    } catch (err) {
        console.error("Connection error:", err)
    }
}

main().catch(err => console.error("Fatal:", err));
