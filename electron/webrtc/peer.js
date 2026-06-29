// let peerConnection = null;

export function createPeerConnection() {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("ICE Candidate Found");
            console.log(event.candidate);
        } else {
            console.log("ICE Gathering Finished");
        }
    };

    peerConnection.onicegatheringstatechange = () => {
        console.log(
            "ICE Gathering State:",
            peerConnection.iceGatheringState
        );
    };


    peerConnection.onconnectionstatechange = () => {
        console.log(
            "Connection State:",
            peerConnection.connectionState
        );
    };

    peerConnection.oniceconnectionstatechange = () => {
        console.log(
            "ICE Connection State:",
            peerConnection.iceConnectionState
        );
    };

    peerConnection.onsignalingstatechange = () => {
        console.log(
            "Signaling State:",
            peerConnection.signalingState
        );
    };

    console.log("Peer Connection Created");
    return peerConnection;
}

export function addAudioStream(peerConnection, stream) {
    const tracks = stream.getAudioTracks();
    for (const track of tracks) {
        peerConnection.addTrack(track, stream);
        console.log("added track", track);
    }
}

/**
 * - it creates the offer and contains details about the connection
 * @returns offer
 */
export async function createOffer(peerConnection) {
    const offer = await peerConnection.createOffer();
    console.log("Offer Created");
    console.log(offer);
    return offer;
}

export async function createAndSetLocalOffer(peerConnection) {
    const offer = await createOffer(peerConnection);
    await peerConnection.setLocalDescription(offer);
    console.log("Local Description Set");
    return offer;
}

