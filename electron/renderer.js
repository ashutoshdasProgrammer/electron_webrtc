
// import CaptureManager from "./audio/capture.js";
// const {CaptureManager} = require('./audio/capture.js');


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


    /**
     * - this function will return the system audio to us. 
     * - It will enable the loopback mode and capture the system audio.
     * @returns systemAudio
    */
    let systemAudioStream = null;
    async function startSystemAudioCapture() {
        try {

            await window.loopback.enable();

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            stream.getVideoTracks().forEach(track => {
                track.stop();
                stream.removeTrack(track);
            });

            await window.loopback.disable();

            systemAudioStream = stream;

            console.log("System audio captured.");
            console.log(stream);

            console.log(stream.getAudioTracks());

            return stream;

        } catch (err) {

            await window.loopback.disable();

            console.error(err);

        }
    }


    /**
     * - we will analyse the audio.
     * - print the sound level in the console.
     * - if perfectly printing then we will say that we are able to take system audio
     */
    function analyseAudio(stream) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        function checkLevel() {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            let average = sum / dataArray.length;
            // console.log("Audio level: ", Math.round(average));

            if (Math.round(average) > 5) {
                console.log("Audio Level:", Math.round(average));
            }

            requestAnimationFrame(checkLevel);
        }
        checkLevel();
    }


    const startButton = document.getElementById('start_stream');

    startButton.addEventListener('click', async () => {
        try {
            const stream = await startSystemAudioCapture();
            analyseAudio(stream);
        } catch (err) {
            console.log(err);
        }

    })
})