const statusText = document.getElementById("status");
const audio = document.getElementById("remoteAudio");

const socket = new WebSocket(`ws://${window.location.host}`);

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

// -------------------- SOCKET OPEN --------------------
socket.onopen = () => {
    statusText.innerText = "Connected to server";

    socket.send(JSON.stringify({
        type: "join",
        room: roomId,
        role: "mobile"
    }));
};

// -------------------- ICE SEND (ONLY ONCE) --------------------
pc.onicecandidate = (event) => {
    if (event.candidate) {
        socket.send(JSON.stringify({
            type: "ice",
            room: roomId,
            candidate: event.candidate
        }));
    }
};

// -------------------- RECEIVE SIGNALS --------------------
socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    console.log("Message:", data);

    // 1. OFFER from Electron
    if (data.type === "offer") {
        statusText.innerText = "Receiving audio...";

        await pc.setRemoteDescription(data.offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.send(JSON.stringify({
            type: "answer",
            room: roomId,
            answer
        }));
    }

    // 2. ICE from Electron
    if (data.type === "ice") {
        try {
            await pc.addIceCandidate(data.candidate);
        } catch (err) {
            console.log("ICE error:", err);
        }
    }
};

// -------------------- AUDIO RECEIVER --------------------
pc.ontrack = (event) => {
    console.log("🔥 Track received on mobile");

    if (event.streams && event.streams[0]) {
        audio.srcObject = event.streams[0];
    } else {
        if (!audio.srcObject) {
            audio.srcObject = new MediaStream();
        }
        audio.srcObject.addTrack(event.track);
    }

    audio.play().catch(err => {
        console.log("Autoplay blocked:", err);
    });
};