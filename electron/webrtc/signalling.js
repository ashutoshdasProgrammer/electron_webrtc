
import { getPeerConnection } from "./peer.js";

let socket = null;
let roomId = null;



export function connectToSignalingServer(id) {
    roomId = id;
    socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
        console.log("Connected To Signaling Server");
        socket.send(JSON.stringify({
            type: "join",
            room: roomId,
            role: "electron"
        }))
    };

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Message from server : ", data);
        handleSignalingData(data);
    }

}

export function setPeerConnection(pc) {
    peerConnectionRef = pc;
}


export function sendOffer(offer) {
    socket.send(JSON.stringify({
        type: "offer",
        room: roomId,
        offer
    }));
}

export function sendICE(candidate) {
    socket.send(JSON.stringify({
        type: "ice",
        room: roomId,
        candidate
    }));
}

async function handleSignalingData(data) {

    const pc = getPeerConnection();

    switch (data.type) {
        case "answer":
            console.log("Answer received");
            await pc.setRemoteDescription(
                data.answer
            );
            break;

        case "ice":
            console.log("ICE received");
            await pc.addIceCandidate(
                data.candidate
            );
            break;

        default:
            console.log("Unknown message", data);
    }
}