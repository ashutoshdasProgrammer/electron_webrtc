


    /**
     * - we will analyse the audio.
     * - print the sound level in the console.
     * - if perfectly printing then we will say that we are able to take system audio
     */
    
export default function analyseAudio(stream) {
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