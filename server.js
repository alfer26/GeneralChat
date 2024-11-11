import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let usersData = [];

wss.on("connection", (ws) => {
    let userDataClient;
    ws.on("message", (messageData) => {
        const { type, message, userData } = JSON.parse(messageData);
        if (type === "join") {
            userDataClient = userData;
            console.log(`${userDataClient.username} has connected`);
            const assignID = {
                type: "assignID",
                message: getID(),
            };
            ws.send(JSON.stringify(assignID));
            userDataClient.id = assignID.message;
            usersData.push(userDataClient);
            sendEveryone(JSON.stringify(JSON.parse(messageData)));
            sendEveryone(
                JSON.stringify({ type: "usersList", message: usersData })
            );
        }
        if (type === "message") {
            console.log(
                `Пришло сообщение от ${userData.username}: '${message}'`
            );
            sendEveryone(JSON.stringify(JSON.parse(messageData)));
        }
    });
    ws.on("close", () => {
        const messageData = {
            type: "leave",
            message: userDataClient,
            userData: userDataClient,
        };
        usersData = usersData.filter((user) => user.id !== userDataClient.id);
        sendEveryone(JSON.stringify(messageData));
        sendEveryone(JSON.stringify({ type: "usersList", message: usersData }));
        console.log(`${userDataClient.username} has disconnected`);
    });
});

function getID() {
    let id = 0;
    if (
        usersData.length - 1 ==
        usersData
            .sort((a, b) => {
                a - b;
            })
            .at(-1)
    ) {
        id = usersData.length;
    } else {
        while (usersData.some((item) => item.id === id)) {
            ++id;
        }
    }
    return id;
}

function sendEveryone(message) {
    wss.clients.forEach((client) => {
        client.send(message);
    });
}