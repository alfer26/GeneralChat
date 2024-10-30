import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map(); // Хранение клиентов и их данных

function checkConnection(ws) {
  const startTime = Date.now();
  ws.ping();
  return new Promise((resolve) => {
    ws.once('pong', () => {
      const latency = Date.now() - startTime;
      resolve(latency);
    });
  });
}

wss.on('connection', (ws) => {
  clients.set(ws, { latency: 0 });
  
  // Проверка соединения каждые 5 секунд
  const interval = setInterval(async () => {
    try {
      const latency = await checkConnection(ws);
      clients.set(ws, { latency });
      
      // Отправка всем клиентам обновленного списка
      const clientsList = Array.from(clients.values());
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'connections', data: clientsList }));
        }
      });
    } catch(e) {
      clients.delete(ws);
    }
  }, 5000);

  ws.on('close', () => {
    clearInterval(interval);
    clients.delete(ws);
  });
});