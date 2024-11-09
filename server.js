import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let usersData = [];

wss.on("connection", (ws) => {
    let userData;
    ws.on("message", (messageData) => {
        const { type, message } = JSON.parse(messageData);
        if (type === "join") {
            userData = message;
            console.log(`${userData.username} has connected`);
            const assignID = {
                type: "assignID",
                message: getID(),
            };
            ws.send(JSON.stringify(assignID));
            userData.id = assignID.message;
            usersData.push(userData);
            sendEveryone(JSON.stringify(JSON.parse(messageData)));
            sendEveryone(JSON.stringify({type: 'usersList', message: usersData}));
        }

    });
    ws.on("close", () => {
        const messageData = {
            type: "leave",
            message: userData,
        };
        usersData = usersData.filter((user) => user.id !== userData.id);
        sendEveryone(JSON.stringify(messageData));
        sendEveryone(JSON.stringify({type: 'usersList', message: usersData}));
        console.log(`${userData.username} has disconnected`);
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

// const clients = new Map(); // Хранение клиентов и их данных

// function checkConnection(ws) {
//   const startTime = Date.now();
//   ws.ping();
//   return new Promise((resolve) => {
//     ws.once('pong', () => {
//       const latency = Date.now() - startTime;
//       resolve(latency);
//     });
//   });
// }

// wss.on('connection', (ws) => {
//   clients.set(ws, { latency: 0 });

//   // Проверка соединения каждые 5 секунд
//   const interval = setInterval(async () => {
//     try {
//       const latency = await checkConnection(ws);
//       clients.set(ws, { latency });

//       // Отправка всем клиентам обновленного списка
//       const clientsList = Array.from(clients.values());
//       wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify({ type: 'connections', data: clientsList }));
//         }
//       });
//     } catch(e) {
//       clients.delete(ws);
//     }
//   }, 5000);

//   ws.on('close', () => {
//     clearInterval(interval);
//     clients.delete(ws);
//   });
// });
