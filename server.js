require('dotenv').config()
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT });

const rooms = {};

wss.on('connection', (ws) => {
    let currentRoom = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            currentRoom = data.room;
            if (!rooms[currentRoom]) {
                rooms[currentRoom] = [];
            }
            rooms[currentRoom].push(ws);
        } else if (currentRoom && rooms[currentRoom]) {
            // Broadcast the message to other clients in the same room
            rooms[currentRoom].forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    });

    ws.on('close', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom] = rooms[currentRoom].filter(client => client !== ws);
            if (rooms[currentRoom].length === 0) {
                delete rooms[currentRoom];
            }
        }
    });
});

console.log('Signaling server is running on ws://localhost:' + process.env.PORT);
