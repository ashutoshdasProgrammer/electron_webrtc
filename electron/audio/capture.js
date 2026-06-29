let systemAudioStream = null;

 /**
     * - this function will return the system audio to us. 
     * - It will enable the loopback mode and capture the system audio.
     * - it retuns a mediastream
     * @returns systemAudio
    */
    
export default async function startSystemAudioCapture() {
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