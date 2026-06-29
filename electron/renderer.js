import startSystemAudioCapture from "./audio/capture.js";
import analyseAudio from "./audio/analyser.js";
import { createPeerConnection, addAudioStream, createOffer, setLocalOffer} from "./webrtc/peer.js";

document.addEventListener("DOMContentLoaded", () => {


    const stealth_mode = document.getElementById('stealth_mode_button');
    stealth_mode.addEventListener('click', async () => {
        await window.stealth.toggle_stealth_mode() // going to preload.js
    })

    // create a random session Id
    const generatedSessionID =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

    const secureMobileEndpoint = `https://your-live-relay-server.com/mobile.html?room=${generatedSessionID}`

    // create a url.
    const canvasElement = document.getElementById('qr-canvas')
    // qr-code painted to canvas.
    // exposing the qr function to preload.js

    async function displayQR() {
        try {
            const qrDataUrl = await window.qr.generate(`${secureMobileEndpoint}`, {
                width: 200,
                margin: 1
            })
            // 2. Setup your canvas context
            const canvas = document.getElementById('qr-canvas')
            const ctx = canvas.getContext('2d')

            // 3. Create a temporary image object to load the data
            const img = new Image()
            img.src = qrDataUrl

            // 4. Wait for the image data to load, then paint it
            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height

                // Clear old drawings so they don't ghost or overlap underneath
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
            }
        } catch (error) {
            console.log('failed to generate qr code: ', error)
        }
    }
    displayQR()

    // -------------------------------------------------------------------------------------


   

    const startButton = document.getElementById('start_stream');

    startButton.addEventListener('click', async () => {
        try {
            const stream = await startSystemAudioCapture();
            // analyseAudio(stream);
            const peerConnection = createPeerConnection();
            addAudioStream(stream);
            const offer = await setLocalOffer();
            console.log(offer);
            console.log(peerConnection.getSenders());
        } catch (err) {
            console.log(err);
        }

    })
})