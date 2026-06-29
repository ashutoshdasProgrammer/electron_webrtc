const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const rooms = {};

const app = express();

// created http server
const server = http.createServer(app);

// create websocket server
const wss = new WebSocket.Server({
    server
});

console.log(__dirname);
app.use('/mobile-client', express.static(path.join(__dirname, '../mobile-client')));

const PORT = 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Server running on port ${PORT}`
    );
});

wss.on("connection", (socket) => {
    console.log("New Client Connected");
    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            console.log("Received:", data);

            // 1. Handle JOIN first (room will be undefined initially)
            if (data.type === "join") {
                const { room, role } = data;

                if (!rooms[room]) {
                    rooms[room] = {
                        electron: null,
                        mobile: null
                    };
                }

                rooms[room][role] = socket;
                socket.room = room;
                socket.role = role;

                console.log("Room updated:", rooms);
                return;
            }

            // 2. Ensure room exists for other message types
            const room = rooms[data.room];
            if (!room) {
                console.log(`Room ${data.room} not found for type ${data.type}`);
                return;
            }

            // OFFER from electron → mobile
            if (data.type === "offer" && room.mobile) {
                room.mobile.send(JSON.stringify(data));
            }

            // ANSWER from mobile → electron
            if (data.type === "answer" && room.electron) {
                room.electron.send(JSON.stringify(data));
            }

            // ICE forwarding both ways
            if (data.type === "ice") {
                if (socket.role === "electron" && room.mobile) {
                    room.mobile.send(JSON.stringify(data));
                }

                if (socket.role === "mobile" && room.electron) {
                    room.electron.send(JSON.stringify(data));
                }
            }
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    socket.on("close", () => {
        console.log("Client Disconnected");
        if (socket.room && rooms[socket.room]) {
            rooms[socket.room][socket.role] = null;
            if (!rooms[socket.room].electron && !rooms[socket.room].mobile) {
                delete rooms[socket.room];
            }
            console.log("Room updated (disconnect):", rooms);
        }
    });
});