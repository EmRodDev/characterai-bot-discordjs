const { spawn } = require('child_process');


module.exports = {
    restartBot() {
        spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: 'inherit'
        });
        process.exit();
    },
    upsampleFrame(frame) {
        // Discord's raw audio encoder expects 48 kHz stereo PCM. Character.AI's
        // LiveKit stream is 48 kHz mono, so copy every signed 16-bit sample to
        // both the left and right channel.
        const sampleCount = Math.floor(frame.length / 2);
        const upsampled = Buffer.alloc(sampleCount * 4);
    
        for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
            const sample = frame.readInt16LE(sampleIndex * 2);
            const outputOffset = sampleIndex * 4;
            upsampled.writeInt16LE(sample, outputOffset);
            upsampled.writeInt16LE(sample, outputOffset + 2);
        }
    
        return upsampled;
    }

}
