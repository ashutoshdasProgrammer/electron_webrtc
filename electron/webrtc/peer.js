let peerConnection = null;

export function createPeerConnection(){
    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });

    console.log("peer connection created");
    return peerConnection;
}

export function addAudioStream(stream) {
    const tracks = stream.getAudioTracks();
    for(const track of tracks){
        peerConnection.addTrack(track, stream);
        console.log("added track", track);
    }
}

export async function createOffer() {
    const offer = await peerConnection.createOffer();
    console.log("Offer Created");
    console.log(offer);
    return offer;
}

export async function setLocalOffer() {
    const offer = await createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Local Description Set");
    return offer;
}