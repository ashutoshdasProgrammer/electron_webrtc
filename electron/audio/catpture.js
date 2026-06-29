class CaptureManager {
    constructor(){
        this.stream = null;
    }

    async start(){
        try{
            // enable loopback mode
            await window.loopback.enable();

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            // remove vedio tracks
            stream.getVedioTracks().forEach(track => {
                track.stop();
                stream.removeTrack(track);
            });

            // restore normal behaviour
            await window.loopback.disable();

            this.stream = stream;

            console.log("Capture started");
            console.log(stream);

            return stream;
        }
        catch (error) {
            await window.loopback.disable();

            console.log(error);
            throw error;
        }
    }

    stop() {
        if(!this.stream)
            return;

        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        console.log('capture stopped')
    }
    getStream(){
        return this.stream;
    }

}
export default new CaptureManager();

