const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();

// created http server
const server = http.createServer(app);

// create websocket server
const wss = new WebSocket.Server({
    server
});

app.use(express.static(path.join(__dirname, "../mobile-client")));

const PORT = 3000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});

wss.on("connection", (socket) => {

    console.log("New Client Connected");

});